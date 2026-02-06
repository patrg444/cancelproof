import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Subscription, ProofDocument, TimelineEvent } from '@/types/subscription';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/storage';

// --- Input validation helpers ---
function sanitizeAmount(value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

const VALID_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL',
  'MXN', 'KRW', 'SEK', 'NOK', 'DKK', 'NZD', 'SGD', 'HKD', 'ZAR', 'PLN',
]);

function sanitizeCurrency(value: string): string {
  const upper = (value || 'USD').trim().toUpperCase();
  return VALID_CURRENCIES.has(upper) ? upper : 'USD';
}

// Convert database row to Subscription type
function dbToSubscription(row: any): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    renewalDate: row.renewal_date,
    billingPeriod: row.billing_period,
    category: row.category,
    intent: row.intent,
    cancelByRule: row.cancel_by_rule,
    cancelByDate: row.cancel_by_date,
    cancelByDaysBefore: row.cancel_by_days_before,
    cancelByNotes: row.cancel_by_notes,
    cancellationMethod: row.cancellation_method,
    cancellationUrl: row.cancellation_url,
    cancellationSteps: row.cancellation_steps,
    requiredInfo: row.required_info,
    supportContact: row.support_contact,
    reminders: row.reminders as Subscription['reminders'],
    proofDocuments: (row.proof_documents || []) as ProofDocument[],
    proofStatus: row.proof_status,
    timeline: (row.timeline || []) as TimelineEvent[],
    status: row.status,
    trialEndDate: row.trial_end_date,
    cancellationDate: row.cancellation_date,
    cancelAttemptDate: row.cancel_attempt_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert Subscription to database format
function subscriptionToDb(sub: Subscription, userId: string): any {
  return {
    id: sub.id,
    user_id: userId,
    name: (sub.name || '').trim().slice(0, 200),
    amount: sanitizeAmount(sub.amount),
    currency: sanitizeCurrency(sub.currency),
    renewal_date: sub.renewalDate,
    billing_period: sub.billingPeriod,
    category: sub.category,
    intent: sub.intent,
    cancel_by_rule: sub.cancelByRule,
    cancel_by_date: sub.cancelByDate,
    cancel_by_days_before: sub.cancelByDaysBefore,
    cancel_by_notes: sub.cancelByNotes,
    cancellation_method: sub.cancellationMethod,
    cancellation_url: sub.cancellationUrl,
    cancellation_steps: sub.cancellationSteps,
    required_info: sub.requiredInfo,
    support_contact: sub.supportContact,
    reminders: sub.reminders,
    proof_documents: sub.proofDocuments,
    proof_status: sub.proofStatus,
    timeline: sub.timeline,
    status: sub.status,
    trial_end_date: sub.trialEndDate,
    cancellation_date: sub.cancellationDate,
    cancel_attempt_date: sub.cancelAttemptDate,
    notes: sub.notes,
    created_at: sub.createdAt,
    updated_at: sub.updatedAt,
  };
}

export function useSubscriptions() {
  const { user, isConfigured } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscriptions
  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (supabase && user) {
        // Load from Supabase
        const { data, error: dbError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('cancel_by_date', { ascending: true });

        if (dbError) throw dbError;

        const subs = (data || []).map(dbToSubscription);
        setSubscriptions(subs);

        // Also save to localStorage as backup
        saveToLocalStorage({ subscriptions: subs, version: '1.0.0' });
      } else {
        // Load from localStorage (offline mode)
        const data = loadFromLocalStorage();
        setSubscriptions(data?.subscriptions || []);
      }
    } catch (err) {
      // Fallback to localStorage on error
      const data = loadFromLocalStorage();
      setSubscriptions(data?.subscriptions || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // Add subscription
  const addSubscription = useCallback(async (
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Subscription> => {
    const newSubscription: Subscription = {
      ...subscription,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (supabase && user) {
        const { error: dbError } = await supabase
          .from('subscriptions')
          .insert(subscriptionToDb(newSubscription, user.id));

        if (dbError) throw dbError;
      }

      const updated = [...subscriptions, newSubscription];
      setSubscriptions(updated);
      saveToLocalStorage({ subscriptions: updated, version: '1.0.0' });

      return newSubscription;
    } catch (err) {
      throw err;
    }
  }, [subscriptions, user]);

  // Update subscription
  const updateSubscription = useCallback(async (
    subscription: Subscription
  ): Promise<Subscription> => {
    const updatedSubscription = {
      ...subscription,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (supabase && user) {
        const { error: dbError } = await supabase
          .from('subscriptions')
          .update(subscriptionToDb(updatedSubscription, user.id))
          .eq('id', subscription.id)
          .eq('user_id', user.id);

        if (dbError) throw dbError;
      }

      const updated = subscriptions.map(sub =>
        sub.id === subscription.id ? updatedSubscription : sub
      );
      setSubscriptions(updated);
      saveToLocalStorage({ subscriptions: updated, version: '1.0.0' });

      return updatedSubscription;
    } catch (err) {
      throw err;
    }
  }, [subscriptions, user]);

  // Delete subscription
  const deleteSubscription = useCallback(async (id: string): Promise<void> => {
    try {
      if (supabase && user) {
        const { error: dbError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (dbError) throw dbError;
      }

      const updated = subscriptions.filter(sub => sub.id !== id);
      setSubscriptions(updated);
      saveToLocalStorage({ subscriptions: updated, version: '1.0.0' });
    } catch (err) {
      throw err;
    }
  }, [subscriptions, user]);

  // Sync local data to cloud (for when user logs in)
  const syncToCloud = useCallback(async (): Promise<void> => {
    if (!supabase || !user) return;

    const localData = loadFromLocalStorage();
    if (!localData?.subscriptions.length) return;

    try {
      // Get existing cloud subscriptions
      const { data: cloudData } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id);

      const cloudIds = new Set((cloudData || []).map(s => s.id));

      // Upload local subscriptions that don't exist in cloud
      const toUpload = localData.subscriptions.filter(s => !cloudIds.has(s.id));

      if (toUpload.length > 0) {
        const { error } = await supabase
          .from('subscriptions')
          .insert(toUpload.map(s => subscriptionToDb(s, user.id)));

        if (error) throw error;
      }

      // Reload to get merged data
      await loadSubscriptions();
    } catch {
      // Sync error handled gracefully - local data preserved
    }
  }, [user, loadSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refresh: loadSubscriptions,
    syncToCloud,
    isCloudEnabled: isConfigured && !!user,
  };
}
