import { Crown, Lock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface UpgradePromptProps {
  title: string;
  message: string;
  emoji?: string;
  onUpgrade: () => void;
  variant?: 'inline' | 'overlay' | 'banner' | 'badge-only';
  className?: string;
}

/**
 * Reusable upgrade prompt component with multiple visual variants.
 * Used throughout the app to soft-gate Pro features.
 */
export function UpgradePrompt({
  title,
  message,
  emoji,
  onUpgrade,
  variant = 'inline',
  className = '',
}: UpgradePromptProps) {
  if (variant === 'badge-only') {
    return (
      <button
        onClick={onUpgrade}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 hover:from-yellow-200 hover:to-amber-200 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 transition-colors cursor-pointer ${className}`}
      >
        <Crown className="h-2.5 w-2.5" />
        PRO
      </button>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[2px] rounded-lg flex items-center justify-center z-10 ${className}`}>
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {emoji && <span className="text-lg">{emoji}</span>}
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>
          <Button
            size="sm"
            className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs h-7 px-3"
            onClick={onUpgrade}
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          {emoji && <span className="text-lg shrink-0">{emoji}</span>}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{message}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
          onClick={onUpgrade}
        >
          <Crown className="h-3 w-3 mr-1" />
          Upgrade
        </Button>
      </div>
    );
  }

  // Default: inline
  return (
    <div className={`flex items-center gap-2 py-1.5 px-2.5 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 ${className}`}>
      <Crown className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
      <span className="text-xs text-yellow-700 dark:text-yellow-400">
        {emoji} {message}
      </span>
      <button
        onClick={onUpgrade}
        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-auto"
      >
        Upgrade
      </button>
    </div>
  );
}
