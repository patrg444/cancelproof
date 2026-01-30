import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Stripe publishable key not configured');
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

// Create checkout session (requires backend)
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  returnUrl: string
): Promise<{ url: string } | { error: string }> {
  try {
    // In production, this would call your backend API
    // which creates a Stripe Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('Checkout error:', error);
    return { error: 'Failed to start checkout. Please try again.' };
  }
}

// Create billing portal session (requires backend)
export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<{ url: string } | { error: string }> {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('Portal error:', error);
    return { error: 'Failed to open billing portal. Please try again.' };
  }
}
