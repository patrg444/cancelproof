#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  applySqlFiles,
  assert,
  ensureSupabaseStarted,
  stageFunctionsFromApp,
  startFakeStripeServer,
  startSupabaseFunctionsServe,
  stripeSignatureHeader,
  supabaseStatus,
  resetPublicSchema,
  waitForHttp,
} from "../../ops/e2e/helpers.mjs";

function sqlFilesForApp(appDir) {
  const migrationsDir = path.join(appDir, "supabase", "migrations");
  if (fs.existsSync(migrationsDir)) {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => path.join(migrationsDir, f));
    if (files.length) return files;
  }

  const schemaFile = path.join(appDir, "supabase", "schema.sql");
  if (fs.existsSync(schemaFile)) return [schemaFile];

  throw new Error("No schema.sql or supabase/migrations found for this app");
}

function parseSessionIdFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last || null;
  } catch {
    return null;
  }
}

async function callSupabaseFunction({ apiUrl, anonKey, accessToken, name, body, timeoutMs = 20_000 }) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${apiUrl}/functions/v1/${name}`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body ?? {}),
        signal: controller.signal,
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const retryable = res.status === 502 || res.status === 503 || res.status === 504;
        if (retryable && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 250 * attempt));
          continue;
        }
        throw new Error(`Function ${name} failed: HTTP ${res.status} ${text.slice(0, 500)}`);
      }

      return json;
    } catch (err) {
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 250 * attempt));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const appDir = path.resolve(__dirname, "..");

  await ensureSupabaseStarted();
  const status = await supabaseStatus();

  await resetPublicSchema({ dbUrl: status.dbUrl });
  await applySqlFiles({ dbUrl: status.dbUrl, files: sqlFilesForApp(appDir) });

  stageFunctionsFromApp(appDir);

  const fakeStripe = await startFakeStripeServer();
  const webhookSecret = `whsec_e2e_${crypto.randomBytes(8).toString("hex")}`;

  const functionsServe = startSupabaseFunctionsServe({
    env: {
      STRIPE_SECRET_KEY: "sk_test_e2e",
      STRIPE_WEBHOOK_SECRET: webhookSecret,
      STRIPE_API_HOST: fakeStripe.dockerHost,
      STRIPE_API_PROTOCOL: "http",
      STRIPE_API_PORT: String(fakeStripe.port),
      APP_URL: "http://127.0.0.1:3000",
      CORS_ORIGIN: "*",
    },
  });

  try {
    await waitForHttp(`${status.apiUrl}/functions/v1/stripe-webhook`, { timeoutMs: 60_000 });

    const email = `e2e+${Date.now()}@example.com`;
    const password = `Passw0rd!${crypto.randomBytes(6).toString("hex")}Aa`;

    const anon = createClient(status.apiUrl, status.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: signUpData, error: signUpError } = await anon.auth.signUp({ email, password });
    if (signUpError) throw signUpError;
    assert(signUpData.user?.id, "Expected signUp user id");
    assert(signUpData.session?.access_token, "Expected signUp session");

    const userId = signUpData.user.id;
    const accessToken = signUpData.session.access_token;

    const user = createClient(status.apiUrl, status.anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Core flow: create a tracked subscription
    const { error: subError } = await user.from("subscriptions").insert({
      user_id: userId,
      name: "E2E Netflix",
      amount: 9.99,
      currency: "USD",
      renewal_date: "2026-02-15",
      billing_period: "monthly",
      cancel_by_date: "2026-02-10",
    });
    if (subError) throw subError;

    // Money path: create checkout session (Pro)
    const checkoutData = await callSupabaseFunction({
      apiUrl: status.apiUrl,
      anonKey: status.anonKey,
      accessToken,
      name: "create-checkout",
      body: { priceId: "price_e2e_pro", billingPeriod: "monthly" },
    });
    assert(checkoutData?.url, "Expected checkout url");

    const sessionId = parseSessionIdFromUrl(checkoutData.url);
    assert(sessionId, "Could not parse checkout session id from url");
    const session = fakeStripe.getCheckoutSession(sessionId);
    assert(session, "Fake Stripe did not record checkout session");

    const event = {
      id: `evt_${crypto.randomBytes(8).toString("hex")}`,
      object: "event",
      api_version: "2023-10-16",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      type: "checkout.session.completed",
      data: { object: session },
    };
    const payload = JSON.stringify(event);

    const webhookRes = await fetch(`${status.apiUrl}/functions/v1/stripe-webhook`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": stripeSignatureHeader(payload, webhookSecret),
      },
      body: payload,
    });
    assert(webhookRes.ok, `Webhook failed: HTTP ${webhookRes.status}`);

    const { data: userSub, error: userSubError } = await user
      .from("user_subscriptions")
      .select("status, plan, stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .single();
    if (userSubError) throw userSubError;
    assert(userSub?.plan === "pro", `Expected plan=pro, got ${userSub?.plan}`);
    assert(userSub?.status === "active", `Expected status=active, got ${userSub?.status}`);

    // Billing portal should open
    const { data: portalData, error: portalError } = await user.functions.invoke("create-portal-session", { body: {} });
    if (portalError) throw new Error(portalError.message);
    assert(portalData?.url, "Expected billing portal url");
  } finally {
    await functionsServe.stop();
    await fakeStripe.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
