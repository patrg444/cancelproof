import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const QUERY_KEY = ['subscriptions'] as const;

async function fetchSubscriptions(userId: string | undefined): Promise<Subscription[]> {
  if (supabase && userId) {
    const { data, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('cancel_by_date', { ascending: true });

    if (dbError) throw dbError;

    const subs = (data || []).map(dbToSubscription);
    saveToLocalStorage({ subscriptions: subs, version: '1.0.0' });
    return subs;
  }

  // Offline mode
  const localData = loadFromLocalStorage();
  return localData?.subscriptions || [];
}

export function useSubscriptions() {
  const { user, isConfigured } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: [...QUERY_KEY, user?.id],
    queryFn: () => fetchSubscriptions(user?.id),
    staleTime: 1000 * 60 * 2,
    meta: { fallback: true },
  });

  const error = queryError ? String(queryError) : null;

  // --- Mutations with optimistic cache updates ---
  const addMutation = useMutation({
    mutationFn: async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newSubscription: Subscription = {
        ...subscription,
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (supabase && user) {
        const { error: dbError } = await supabase
          .from('subscriptions')
          .insert(subscriptionToDb(newSubscription, user.id));
        if (dbError) throw dbError;
      }

      return newSubscription;
    },
    onSuccess: (newSub) => {
      queryClient.setQueryData([...QUERY_KEY, user?.id], (old: Subscription[] | undefined) => {
        const updated = [...(old || []), newSub];
        saveToLocalStorage({ subscriptions: updated, version: '1.0.0' });
        return updated;
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (subscription: Subscription) => {
      const updatedSubscription = {
        ...subscription,
        updatedAt: new Date().toISOString(),
      };

      if (supabase && user) {
        const { error: dbError } = await supabase
          .from('subscriptions')
          .update(subscriptionToDb(updatedSubscription, user.id))
          .eq('id', subscription.id)
          .eq('user_id', user.id);
        if (dbError) throw dbError;
      }

      return updatedSubscription;
    },
    onSuccess: (updatedSub) => {
      queryClient.setQueryData([...QUERY_KEY, user?.id], (old: Subscription[] | undefined) => {
        const updated = (old || []).map(sub => sub.id === updatedSub.id ? updatedSub : sub);
        saveToLocalStorage({ subscriptions: updated, version: '1.0.0' });
        return updated;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (supabase && user) {
        const { error: dbError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (dbError) throw dbError;
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData([...QUERY_KEY, user?.id], (old: Subscription[] | undefined) => {
        const updated = (old || []).filter(sub => sub.id !== id);
        saveToLocalStorage({ subscriptions: updated, version: '1.0.0' });
        return updated;
      });
    },
  });

  // Sync local data to cloud (for when user logs in)
  const syncToCloud = useCallback(async (): Promise<void> => {
    if (!supabase || !user) return;

    const localData = loadFromLocalStorage();
    if (!localData?.subscriptions.length) return;

    try {
      const { data: cloudData } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id);

      const cloudIds = new Set((cloudData || []).map(s => s.id));
      const toUpload = localData.subscriptions.filter(s => !cloudIds.has(s.id));

      if (toUpload.length > 0) {
        const { error } = await supabase
          .from('subscriptions')
          .insert(toUpload.map(s => subscriptionToDb(s, user.id)));
        if (error) throw error;
      }

      // Reload to get merged data
      await refetch();
    } catch {
      // Sync error handled gracefully - local data preserved
    }
  }, [user, refetch]);

  return {
    subscriptions,
    loading,
    error,
    addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => addMutation.mutateAsync(sub),
    updateSubscription: (sub: Subscription) => updateMutation.mutateAsync(sub),
    deleteSubscription: (id: string) => deleteMutation.mutateAsync(id),
    refresh: refetch,
    syncToCloud,
    isCloudEnabled: isConfigured && !!user,
  };
}
