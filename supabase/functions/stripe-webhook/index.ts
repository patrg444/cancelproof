import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripeConfig: any = {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
};
const stripeHost = Deno.env.get("STRIPE_API_HOST");
const stripeProtocol = Deno.env.get("STRIPE_API_PROTOCOL");
const stripePort = Deno.env.get("STRIPE_API_PORT");
const stripeTimeoutMs = Number(Deno.env.get("STRIPE_TIMEOUT_MS") || "10000");
if (stripeHost) stripeConfig.host = stripeHost;
if (stripeProtocol) stripeConfig.protocol = stripeProtocol;
if (stripePort) stripeConfig.port = Number(stripePort);
if (Number.isFinite(stripeTimeoutMs)) stripeConfig.timeout = stripeTimeoutMs;
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", stripeConfig);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") || "https://cancelmem.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Stripe webhook is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Use client_reference_id as primary source (most reliable)
        // Fall back to session metadata, then subscription metadata
        const userId = session.client_reference_id
          || session.metadata?.supabase_user_id
          || subscription.metadata.supabase_user_id;

        if (!userId) {
          console.error("No user ID found in session or subscription");
          break;
        }

        console.log("Processing checkout for user:", userId, "from source:",
          session.client_reference_id ? "client_reference_id" :
          session.metadata?.supabase_user_id ? "session_metadata" : "subscription_metadata");

        // Upsert user subscription record
        const { error: upsertError } = await supabase
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            plan: "pro",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          });

        if (upsertError) {
          console.error("Error upserting subscription:", upsertError);
        } else {
          console.log("Subscription created for user:", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabase_user_id;

        if (!userId) {
          console.error("No user ID in subscription metadata");
          break;
        }

        const { error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        } else {
          console.log("Subscription updated for user:", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabase_user_id;

        if (!userId) {
          console.error("No user ID in subscription metadata");
          break;
        }

        const { error: deleteError } = await supabase
          .from("user_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (deleteError) {
          console.error("Error canceling subscription:", deleteError);
        } else {
          console.log("Subscription canceled for user:", userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata.supabase_user_id;

          if (userId) {
            await supabase
              .from("user_subscriptions")
              .update({
                status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);

            console.log("Payment failed for user:", userId);
          }
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
