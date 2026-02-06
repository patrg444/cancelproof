import { useState, useEffect } from 'react';
import {
  BADGE_DEFINITIONS,
  BadgeCategory,
  CATEGORY_LABELS,
  RARITY_COLORS,
  EarnedBadge,
  getBadgeById,
  getBadgeProgress,
  getEarnedByCategory,
  computeEarnedBadges,
  findNewBadges,
  loadBadges,
  saveBadges,
  BadgeDefinition,
} from '@/data/badges';
import { BadgeCard, BadgeDetailDialog } from '@/app/components/BadgeCard';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Subscription } from '@/types/subscription';
import { Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface BadgeShowcaseProps {
  subscriptions: Subscription[];
  compact?: boolean; // For sidebar/card view
}

export function BadgeShowcase({ subscriptions, compact = false }: BadgeShowcaseProps) {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [hasChecked, setHasChecked] = useState(false);

  // Load and compute badges
  useEffect(() => {
    const stored = loadBadges();
    const newlyComputed = computeEarnedBadges(subscriptions, stored);

    // Check for newly earned badges and show toasts
    if (hasChecked) {
      const newOnes = findNewBadges(subscriptions, stored);
      for (const badge of newOnes) {
        toast.success(
          <div className="flex items-center gap-2">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
              <div className="font-semibold">Badge Earned!</div>
              <div className="text-sm text-gray-500">{badge.name}</div>
            </div>
          </div>,
          { duration: 5000 }
        );
      }
    }

    setEarnedBadges(newlyComputed);
    saveBadges(newlyComputed);
    setHasChecked(true);
  }, [subscriptions]);

  const progress = getBadgeProgress(earnedBadges);
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  const filteredBadges = selectedCategory === 'all'
    ? BADGE_DEFINITIONS
    : BADGE_DEFINITIONS.filter(b => b.category === selectedCategory);

  // Sort: earned first, then by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aEarned = earnedIds.has(a.id) ? 0 : 1;
    const bEarned = earnedIds.has(b.id) ? 0 : 1;
    if (aEarned !== bEarned) return aEarned - bEarned;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const handleBadgeClick = (badge: BadgeDefinition) => {
    setSelectedBadge(badge);
    setIsDetailOpen(true);
  };

  // ---- COMPACT VIEW (for embedding in cards) ----
  if (compact) {
    const recentBadges = earnedBadges
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 5);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Achievements
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {progress.earned}/{progress.total}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-yellow-500 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* Recent badges */}
        {recentBadges.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {recentBadges.map((earned) => {
              const badge = getBadgeById(earned.id);
              if (!badge) return null;
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  earned={earned}
                  size="sm"
                  onClick={() => handleBadgeClick(badge)}
                />
              );
            })}
            {earnedBadges.length > 5 && (
              <div className="flex items-center justify-center w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span className="text-xs text-gray-500 dark:text-gray-400">+{earnedBadges.length - 5}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Start tracking and cancelling to earn badges!
          </p>
        )}

        <BadgeDetailDialog
          badge={selectedBadge}
          earned={earnedBadges.find(e => e.id === selectedBadge?.id)}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      </div>
    );
  }

  // ---- FULL VIEW ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track, cancel, and collect — {progress.earned} of {progress.total} badges earned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {progress.percentage}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progress.percentage === 100
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
              : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          All ({progress.earned}/{progress.total})
        </button>
        {(Object.entries(CATEGORY_LABELS) as [BadgeCategory, typeof CATEGORY_LABELS[BadgeCategory]][]).map(
          ([cat, info]) => {
            const catBadges = BADGE_DEFINITIONS.filter(b => b.category === cat);
            const catEarned = catBadges.filter(b => earnedIds.has(b.id)).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                    : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {info.emoji} {info.label} ({catEarned}/{catBadges.length})
              </button>
            );
          }
        )}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {sortedBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedBadges.find(e => e.id === badge.id)}
            size="md"
            onClick={() => handleBadgeClick(badge)}
          />
        ))}
      </div>

      {/* Next badge to earn (motivation) */}
      {progress.earned < progress.total && (() => {
        const nextBadge = BADGE_DEFINITIONS.find(b => !earnedIds.has(b.id));
        if (!nextBadge) return null;
        return (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Next up: {nextBadge.emoji} {nextBadge.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {nextBadge.description}
              </p>
            </div>
          </div>
        );
      })()}

      <BadgeDetailDialog
        badge={selectedBadge}
        earned={earnedBadges.find(e => e.id === selectedBadge?.id)}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
