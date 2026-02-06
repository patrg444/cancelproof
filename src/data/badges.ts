import { Subscription } from '@/types/subscription';
import { calculateSavings, calculateMonthlyEquivalent } from '@/utils/subscriptionUtils';

// Badge categories
export type BadgeCategory = 'savings' | 'cancellation' | 'proof' | 'streak' | 'difficulty' | 'viral';

// Badge rarity for visual styling
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  // Returns true if the badge should be earned based on current state
  check: (subscriptions: Subscription[]) => boolean;
  // Share text for when this badge is earned
  shareText: string;
}

// Rarity colors for styling
export const RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    glow: '',
  },
  uncommon: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-200/50 dark:shadow-blue-800/30',
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    glow: 'shadow-purple-200/50 dark:shadow-purple-800/30',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    border: 'border-yellow-400 dark:border-yellow-600',
    text: 'text-yellow-700 dark:text-yellow-300',
    glow: 'shadow-yellow-200/50 dark:shadow-yellow-800/30 ring-1 ring-yellow-300/30 dark:ring-yellow-600/30',
  },
};

// Category labels
export const CATEGORY_LABELS: Record<BadgeCategory, { label: string; emoji: string }> = {
  savings: { label: 'Savings', emoji: '💰' },
  cancellation: { label: 'Cancellations', emoji: '✂️' },
  proof: { label: 'Proof', emoji: '📸' },
  streak: { label: 'Streaks', emoji: '🔥' },
  difficulty: { label: 'Difficulty', emoji: '⚔️' },
  viral: { label: 'Viral', emoji: '📣' },
};

// ========================================
// BADGE DEFINITIONS
// ========================================
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ---- SAVINGS BADGES ----
  {
    id: 'first-dollar',
    name: 'First Dollar Saved',
    description: 'Cancel your first subscription and start saving',
    emoji: '🪙',
    category: 'savings',
    rarity: 'common',
    check: (subs) => calculateSavings(subs).totalYearlySaved > 0,
    shareText: "Just started saving money by cancelling unused subscriptions with @CancelMem! 🪙",
  },
  {
    id: 'hundred-club',
    name: '$100 Club',
    description: 'Save $100 or more per year',
    emoji: '💵',
    category: 'savings',
    rarity: 'uncommon',
    check: (subs) => calculateSavings(subs).totalYearlySaved >= 100,
    shareText: "I've saved over $100/year by auditing my subscriptions with @CancelMem! 💵",
  },
  {
    id: 'five-hundred-saver',
    name: 'Budget Boss',
    description: 'Save $500 or more per year',
    emoji: '💪',
    category: 'savings',
    rarity: 'rare',
    check: (subs) => calculateSavings(subs).totalYearlySaved >= 500,
    shareText: "Budget Boss status unlocked! Saving over $500/year with @CancelMem 💪",
  },
  {
    id: 'thousand-saver',
    name: 'Subscription Slayer',
    description: 'Save $1,000 or more per year',
    emoji: '🔥',
    category: 'savings',
    rarity: 'epic',
    check: (subs) => calculateSavings(subs).totalYearlySaved >= 1000,
    shareText: "🔥 Subscription Slayer! I'm saving over $1,000/year by cancelling unused subscriptions with @CancelMem",
  },
  {
    id: 'five-thousand-saver',
    name: 'Financial Freedom Fighter',
    description: 'Save $5,000 or more per year',
    emoji: '👑',
    category: 'savings',
    rarity: 'legendary',
    check: (subs) => calculateSavings(subs).totalYearlySaved >= 5000,
    shareText: "👑 Financial Freedom Fighter! Over $5,000/year saved with @CancelMem. That's a vacation!",
  },

  // ---- CANCELLATION BADGES ----
  {
    id: 'first-cancel',
    name: 'The Breakup',
    description: 'Cancel your first subscription',
    emoji: '💔',
    category: 'cancellation',
    rarity: 'common',
    check: (subs) => subs.some(s => s.status === 'cancelled'),
    shareText: "Had my first subscription breakup today 💔 Tracked with @CancelMem",
  },
  {
    id: 'triple-cancel',
    name: 'Serial Canceller',
    description: 'Cancel 3 subscriptions',
    emoji: '✂️',
    category: 'cancellation',
    rarity: 'uncommon',
    check: (subs) => subs.filter(s => s.status === 'cancelled').length >= 3,
    shareText: "Serial Canceller ✂️ 3 subscriptions down! @CancelMem keeps the receipts",
  },
  {
    id: 'five-cancel',
    name: 'The Purge',
    description: 'Cancel 5 subscriptions',
    emoji: '🗑️',
    category: 'cancellation',
    rarity: 'rare',
    check: (subs) => subs.filter(s => s.status === 'cancelled').length >= 5,
    shareText: "🗑️ The Purge is complete! 5 subscriptions cancelled with @CancelMem",
  },
  {
    id: 'ten-cancel',
    name: 'Subscription Minimalist',
    description: 'Cancel 10 subscriptions',
    emoji: '🧘',
    category: 'cancellation',
    rarity: 'epic',
    check: (subs) => subs.filter(s => s.status === 'cancelled').length >= 10,
    shareText: "🧘 Subscription Minimalist — cancelled 10 services and counting with @CancelMem",
  },

  // ---- PROOF BADGES ----
  {
    id: 'first-proof',
    name: 'Receipt Keeper',
    description: 'Upload your first proof of cancellation',
    emoji: '📸',
    category: 'proof',
    rarity: 'common',
    check: (subs) => subs.some(s => s.proofDocuments.length > 0),
    shareText: "Started keeping receipts for my cancellations 📸 @CancelMem has my back",
  },
  {
    id: 'proof-collector',
    name: 'Evidence Collector',
    description: 'Upload 5 proof documents across all subscriptions',
    emoji: '🗂️',
    category: 'proof',
    rarity: 'uncommon',
    check: (subs) => subs.reduce((acc, s) => acc + s.proofDocuments.length, 0) >= 5,
    shareText: "Evidence Collector 🗂️ — 5 proof documents saved with @CancelMem. Try charging me now!",
  },
  {
    id: 'bulletproof',
    name: 'Bulletproof',
    description: 'Have complete proof for 3+ cancelled subscriptions',
    emoji: '🛡️',
    category: 'proof',
    rarity: 'rare',
    check: (subs) => subs.filter(s => s.status === 'cancelled' && s.proofStatus === 'complete').length >= 3,
    shareText: "🛡️ Bulletproof! 3 cancellations fully documented with @CancelMem. Good luck charging me.",
  },

  // ---- DIFFICULTY BADGES ----
  {
    id: 'easy-win',
    name: 'Easy Win',
    description: 'Cancel a service rated Easy (1-2)',
    emoji: '😊',
    category: 'difficulty',
    rarity: 'common',
    check: (subs) => subs.some(s =>
      s.status === 'cancelled' &&
      s.cancellationDifficulty !== undefined &&
      s.cancellationDifficulty <= 2
    ),
    shareText: "Easy win! 😊 Cancelled a simple subscription with @CancelMem",
  },
  {
    id: 'dark-pattern-survivor',
    name: 'Dark Pattern Survivor',
    description: 'Cancel a service rated Difficult or higher (4+)',
    emoji: '😤',
    category: 'difficulty',
    rarity: 'rare',
    check: (subs) => subs.some(s =>
      s.status === 'cancelled' &&
      s.cancellationDifficulty !== undefined &&
      s.cancellationDifficulty >= 4
    ),
    shareText: "😤 Dark Pattern Survivor! Beat a service rated 4/5 difficulty with @CancelMem",
  },
  {
    id: 'boss-fight-winner',
    name: 'Boss Fight Winner',
    description: 'Cancel a service rated Nightmare (5)',
    emoji: '🏆',
    category: 'difficulty',
    rarity: 'epic',
    check: (subs) => subs.some(s =>
      s.status === 'cancelled' &&
      s.cancellationDifficulty !== undefined &&
      s.cancellationDifficulty >= 5
    ),
    shareText: "🏆 Boss Fight Winner! Cancelled a NIGHTMARE-difficulty service with @CancelMem. They can't stop me.",
  },
  {
    id: 'difficulty-conqueror',
    name: 'Difficulty Conqueror',
    description: 'Cancel services across all difficulty levels (1-5)',
    emoji: '⚔️',
    category: 'difficulty',
    rarity: 'legendary',
    check: (subs) => {
      const cancelledDifficulties = new Set(
        subs
          .filter(s => s.status === 'cancelled' && s.cancellationDifficulty !== undefined)
          .map(s => s.cancellationDifficulty)
      );
      return [1, 2, 3, 4, 5].every(d => cancelledDifficulties.has(d as 1|2|3|4|5));
    },
    shareText: "⚔️ Difficulty Conqueror! Cancelled services at EVERY difficulty level with @CancelMem",
  },

  // ---- STREAK / TRACKING BADGES ----
  {
    id: 'tracker',
    name: 'Getting Organized',
    description: 'Track 3 subscriptions',
    emoji: '📋',
    category: 'streak',
    rarity: 'common',
    check: (subs) => subs.length >= 3,
    shareText: "Getting organized! 📋 Tracking 3 subscriptions with @CancelMem",
  },
  {
    id: 'auditor',
    name: 'Subscription Auditor',
    description: 'Track 5 subscriptions',
    emoji: '🔍',
    category: 'streak',
    rarity: 'uncommon',
    check: (subs) => subs.length >= 5,
    shareText: "🔍 Full subscription audit underway! 5 tracked with @CancelMem",
  },
  {
    id: 'power-tracker',
    name: 'Power Tracker',
    description: 'Track 10 or more subscriptions',
    emoji: '📊',
    category: 'streak',
    rarity: 'rare',
    check: (subs) => subs.length >= 10,
    shareText: "📊 Power Tracker! 10 subscriptions under control with @CancelMem",
  },
  {
    id: 'trial-master',
    name: 'Trial Master',
    description: 'Cancel a trial before it converts to paid',
    emoji: '⏱️',
    category: 'streak',
    rarity: 'uncommon',
    check: (subs) => subs.some(s =>
      s.status === 'cancelled' && s.trialEndDate !== undefined
    ),
    shareText: "⏱️ Trial Master! Cancelled before the free trial expired. @CancelMem saved me!",
  },

  // ---- VIRAL BADGES ----
  {
    id: 'share-warrior',
    name: 'Share Warrior',
    description: 'Share your savings card (tracked by download)',
    emoji: '📣',
    category: 'viral',
    rarity: 'common',
    // This badge is triggered by action, not subscription state
    // Will be manually awarded when user shares
    check: () => false,
    shareText: "📣 Sharing my subscription savings with the world! @CancelMem",
  },
  {
    id: 'rage-poster',
    name: 'Rage Poster',
    description: 'Use the Rage Post feature to share your cancellation story',
    emoji: '🔥',
    category: 'viral',
    rarity: 'uncommon',
    // This badge is triggered by action
    check: () => false,
    shareText: "🔥 Rage Poster! Named and shamed a dark pattern service with @CancelMem",
  },
];

// ========================================
// EARNED BADGE TYPE (stored in localStorage)
// ========================================
export interface EarnedBadge {
  id: string;
  earnedAt: string; // ISO date
}

// ========================================
// BADGE COMPUTATION
// ========================================

/**
 * Check which badges the user has earned based on their subscriptions
 * and previously earned action-based badges.
 */
export function computeEarnedBadges(
  subscriptions: Subscription[],
  previouslyEarned: EarnedBadge[]
): EarnedBadge[] {
  const earnedMap = new Map(previouslyEarned.map(b => [b.id, b]));
  const now = new Date().toISOString();

  for (const badge of BADGE_DEFINITIONS) {
    if (earnedMap.has(badge.id)) continue; // Already earned

    if (badge.check(subscriptions)) {
      earnedMap.set(badge.id, { id: badge.id, earnedAt: now });
    }
  }

  return Array.from(earnedMap.values());
}

/**
 * Find newly earned badges (badges earned this computation that weren't previously earned)
 */
export function findNewBadges(
  subscriptions: Subscription[],
  previouslyEarned: EarnedBadge[]
): BadgeDefinition[] {
  const previousIds = new Set(previouslyEarned.map(b => b.id));
  const newBadges: BadgeDefinition[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (previousIds.has(badge.id)) continue;
    if (badge.check(subscriptions)) {
      newBadges.push(badge);
    }
  }

  return newBadges;
}

/**
 * Get badge definition by ID
 */
export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === id);
}

/**
 * Get earned count by category
 */
export function getEarnedByCategory(
  earnedBadges: EarnedBadge[]
): Record<BadgeCategory, number> {
  const counts: Record<BadgeCategory, number> = {
    savings: 0,
    cancellation: 0,
    proof: 0,
    streak: 0,
    difficulty: 0,
    viral: 0,
  };

  for (const earned of earnedBadges) {
    const badge = getBadgeById(earned.id);
    if (badge) {
      counts[badge.category]++;
    }
  }

  return counts;
}

/**
 * Get badge progress - total earned vs total available
 */
export function getBadgeProgress(earnedBadges: EarnedBadge[]): {
  earned: number;
  total: number;
  percentage: number;
} {
  const earned = earnedBadges.length;
  const total = BADGE_DEFINITIONS.length;
  return {
    earned,
    total,
    percentage: total > 0 ? Math.round((earned / total) * 100) : 0,
  };
}

// ========================================
// BADGE STORAGE
// ========================================
const BADGE_STORAGE_KEY = 'cancelproof_badges';

export function loadBadges(): EarnedBadge[] {
  try {
    const stored = localStorage.getItem(BADGE_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as EarnedBadge[];
  } catch {
    return [];
  }
}

export function saveBadges(badges: EarnedBadge[]): void {
  try {
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(badges));
  } catch {
    // Storage unavailable
  }
}

/**
 * Award an action-based badge (like sharing or rage posting)
 */
export function awardActionBadge(badgeId: string): boolean {
  const badge = getBadgeById(badgeId);
  if (!badge) return false;

  const earned = loadBadges();
  if (earned.some(b => b.id === badgeId)) return false; // Already earned

  earned.push({ id: badgeId, earnedAt: new Date().toISOString() });
  saveBadges(earned);
  return true;
}
