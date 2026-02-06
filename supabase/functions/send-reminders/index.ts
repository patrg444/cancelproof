import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const APP_URL = Deno.env.get("APP_URL") || "https://cancelmem.com";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "CancelMem <reminders@cancelmem.com>";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cancel_by_date: string;
  user_id: string;
}

interface UserWithEmail {
  id: string;
  email: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") || "https://cancelmem.com",
  "Access-Control-Allow-Headers": "authorization, x-cron-secret, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isCronAuthorized(req: Request): boolean {
  const headerSecret = req.headers.get("x-cron-secret");
  if (CRON_SECRET && headerSecret && headerSecret === CRON_SECRET) return true;

  const bearer = getBearerToken(req);
  const apikey = req.headers.get("apikey");

  if (CRON_SECRET && bearer && bearer === CRON_SECRET) return true;
  if (SUPABASE_SERVICE_ROLE_KEY && bearer && bearer === SUPABASE_SERVICE_ROLE_KEY) return true;
  if (SUPABASE_SERVICE_ROLE_KEY && apikey && apikey === SUPABASE_SERVICE_ROLE_KEY) return true;

  return false;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return res.json();
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

function generateReminderEmail(subscription: Subscription, daysUntil: number): { subject: string; html: string } {
  const urgencyWord = daysUntil === 0 ? "TODAY" : daysUntil === 1 ? "TOMORROW" : `in ${daysUntil} days`;
  const urgencyColor = daysUntil <= 1 ? "#dc2626" : daysUntil <= 3 ? "#f59e0b" : "#2563eb";

  const subject = daysUntil === 0
    ? `🚨 URGENT: Cancel ${subscription.name} TODAY to avoid charges!`
    : daysUntil === 1
    ? `⚠️ Cancel ${subscription.name} TOMORROW - Don't forget!`
    : `📅 Reminder: Cancel ${subscription.name} in ${daysUntil} days`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #2563eb; border-radius: 8px; padding: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
        </div>
        <h1 style="margin: 12px 0 0; color: #111827; font-size: 24px;">CancelMem</h1>
      </div>

      <!-- Alert Banner -->
      <div style="background-color: ${urgencyColor}; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">
          Cancel ${urgencyWord}!
        </p>
      </div>

      <!-- Subscription Details -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">${subscription.name}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">
              ${formatCurrency(subscription.amount, subscription.currency)}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Cancel by:</td>
            <td style="padding: 8px 0; color: ${urgencyColor}; font-weight: 600; text-align: right;">
              ${new Date(subscription.cancel_by_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${APP_URL}"
           style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Open CancelMem
        </a>
      </div>

      <!-- Tips -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
          <strong>Pro tip:</strong> After cancelling, upload a screenshot or save the confirmation number in CancelMem as proof.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">You're receiving this because you enabled email reminders in CancelMem.</p>
      <p style="margin: 8px 0 0;">
        <a href="${APP_URL}/settings" style="color: #6b7280;">Manage notification settings</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase not configured");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    if (!isCronAuthorized(req)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get today's date and the dates we need to check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDays = [0, 1, 3, 7]; // day-of, 1 day, 3 days, 7 days before
    const datesToCheck = reminderDays.map((days) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split("T")[0];
    });

    console.log("Checking for subscriptions with cancel-by dates:", datesToCheck);

    // Get subscriptions with upcoming cancel-by dates
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("id, name, amount, currency, cancel_by_date, user_id")
      .in("cancel_by_date", datesToCheck)
      .in("status", ["active", "trial"])
      .order("cancel_by_date");

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions need reminders today");
      return new Response(
        JSON.stringify({ message: "No reminders to send", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions needing reminders`);

    // Get user emails and settings
    const userIds = [...new Set(subscriptions.map((s) => s.user_id))];

    const { data: userSettings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, email_reminders")
      .in("user_id", userIds)
      .eq("email_reminders", true);

    if (settingsError) throw settingsError;

    const usersWithEmailEnabled = new Set(userSettings?.map((s) => s.user_id) || []);

    // Get user emails from auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const userEmailMap = new Map<string, string>();
    users?.forEach((user) => {
      if (user.email) {
        userEmailMap.set(user.id, user.email);
      }
    });

    // Send emails
    let sentCount = 0;
    const errors: string[] = [];

    for (const subscription of subscriptions) {
      // Skip if user hasn't enabled email reminders
      if (!usersWithEmailEnabled.has(subscription.user_id)) {
        console.log(`Skipping ${subscription.name} - email reminders disabled`);
        continue;
      }

      const email = userEmailMap.get(subscription.user_id);
      if (!email) {
        console.log(`Skipping ${subscription.name} - no email found`);
        continue;
      }

      // Calculate days until cancel-by date
      const cancelDate = new Date(subscription.cancel_by_date);
      const daysUntil = Math.ceil((cancelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      try {
        const { subject, html } = generateReminderEmail(subscription, daysUntil);
        await sendEmail(email, subject, html);
        sentCount++;
        console.log(`Sent reminder for ${subscription.name} to ${email}`);

        // Record that we sent this reminder
        await supabase.from("scheduled_reminders").upsert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          reminder_date: today.toISOString().split("T")[0],
          reminder_type: `${daysUntil}-days`,
          sent: true,
          sent_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`Failed to send email for ${subscription.name}:`, err);
        errors.push(`${subscription.name}: ${err}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sent ${sentCount} reminder emails`,
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
