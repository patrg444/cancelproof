import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// Pricing plans
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Track up to 5 subscriptions',
      'Basic reminders',
      'Local storage only',
    ],
    limits: {
      subscriptions: 5,
    },
  },
  pro: {
    name: 'Pro',
    priceMonthly: 4.99,
    priceYearly: 39.99,
    stripePriceIdMonthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
    stripePriceIdYearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
    features: [
      'Unlimited subscriptions',
      'Cloud sync across devices',
      'Push notifications',
      'Email reminders',
      'PDF proof exports',
      'Priority support',
    ],
    limits: {
      subscriptions: Infinity,
    },
  },
};

// Check if user has reached free tier limit
export function hasReachedFreeLimit(subscriptionCount: number): boolean {
  return subscriptionCount >= PRICING_PLANS.free.limits.subscriptions;
}

// Create checkout session via Supabase Edge Function
export async function createCheckoutSession(
  priceId: string,
  billingPeriod: 'monthly' | 'yearly',
  authToken: string
): Promise<{ url: string } | { error: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        priceId,
        billingPeriod,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    return { url: data.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.' };
  }
}

// Create billing portal session via Supabase Edge Function
export async function createBillingPortalSession(
  authToken: string
): Promise<{ url: string } | { error: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create portal session');
    }

    return { url: data.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to open billing portal. Please try again.' };
  }
}
