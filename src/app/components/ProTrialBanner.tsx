import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Crown, Sparkles, X, Loader2, Zap, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { startProTrial, TRIAL_CONFIG } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProTrialBannerProps {
  variant?: 'banner' | 'card' | 'compact';
  onDismiss?: () => void;
  onTrialStarted?: () => void;
  className?: string;
}

/**
 * Banner/card prompting free users to start their 7-day Pro trial.
 * Only shown to authenticated free-tier users who haven't already trialed.
 */
export function ProTrialBanner({
  variant = 'banner',
  onDismiss,
  onTrialStarted,
  className = '',
}: ProTrialBannerProps) {
  const { user, isPremium, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show to premium users, unauthenticated users, or if dismissed
  if (isPremium || !user || isDismissed) return null;

  // Check if user already used their trial (stored in localStorage)
  const trialUsedKey = `cancelmem_trial_used_${user.id}`;
  if (typeof window !== 'undefined' && localStorage.getItem(trialUsedKey)) return null;

  const handleStartTrial = async () => {
    if (!supabase) {
      toast.error('Service not available');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Please sign in again');
        return;
      }

      const result = await startProTrial(session.access_token);

      if ('error' in result) {
        toast.error(result.error);
      } else {
        // Mark trial as used
        localStorage.setItem(trialUsedKey, new Date().toISOString());
        await refreshProfile();
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <div className="font-semibold">Pro Trial Activated!</div>
              <div className="text-sm text-gray-500">
                Enjoy {TRIAL_CONFIG.durationDays} days of full Pro features
              </div>
            </div>
          </div>,
          { duration: 5000 }
        );
        onTrialStarted?.();
      }
    } catch {
      toast.error('Unable to start trial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleStartTrial}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 text-sm hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 transition-all ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        )}
        <span className="font-medium text-blue-700 dark:text-blue-300">
          Try Pro free for {TRIAL_CONFIG.durationDays} days
        </span>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 ${className}`}>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Try Pro Free for {TRIAL_CONFIG.durationDays} Days
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get live countdown timers, all rage templates, interactive guides, premium share cards, and more.
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                <Clock className="h-3 w-3" /> Live timers
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                <Zap className="h-3 w-3" /> All templates
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                <Sparkles className="h-3 w-3" /> Premium cards
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={handleStartTrial}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-1.5"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Start Free Trial
                  </>
                )}
              </Button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: banner
  return (
    <div className={`relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-xl p-4 text-white overflow-hidden ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              Try Pro Free for {TRIAL_CONFIG.durationDays} Days
            </p>
            <p className="text-xs opacity-90 truncate">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleStartTrial}
            disabled={isLoading}
            size="sm"
            className="bg-white text-purple-700 hover:bg-gray-100 font-semibold gap-1.5 text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Trial'
            )}
          </Button>
          {onDismiss && (
            <button onClick={handleDismiss} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
