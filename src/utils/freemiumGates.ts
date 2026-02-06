/**
 * Freemium Gating Configuration
 *
 * Strategy: Keep viral/sharing free, gate "power user" features behind Pro.
 * Free tier is generous to build habit; Pro drives conversions from power users.
 */

// ========================================
// GATE DEFINITIONS
// ========================================

export const FREEMIUM_GATES = {
  // Countdown Timers
  timers: {
    free: 'basic', // Static "X days left" text only
    pro: 'full',   // Live pulsing timers with seconds, push notifications
  },

  // Rage Templates
  rageTemplates: {
    freeLimit: 6,      // 6 basic templates (mix of tones)
    proLimit: Infinity, // All 16+ templates
    freeEditing: false, // No inline editing on free
    proEditing: true,   // Full inline editing on Pro
  },

  // Cancellation Guides
  guides: {
    freeBrowse: true,      // Can browse all guides
    freeAutoFill: false,   // No auto-fill on free
    freeCheckboxes: false, // No progress checkboxes on free
    proAutoFill: true,     // Auto-fill on Pro
    proCheckboxes: true,   // Interactive progress on Pro
    proTips: true,         // Pro tips section on Pro
  },

  // Share Cards
  shareCards: {
    freeBasic: true,       // Basic stats-only card
    proGradients: true,    // Premium gradient styles
    proBadgeEmbed: true,   // Badge embed on card
    proCustomText: true,   // Custom text on card
  },

  // Badges
  badges: {
    freeView: true,        // Can view all badges
    freeShare: true,       // Can share earned badges (viral!)
    proExport: true,       // Premium badge export quality
  },

  // Subscriptions
  subscriptions: {
    freeLimit: 5,
    proLimit: Infinity,
  },
} as const;

// ========================================
// FREE RAGE TEMPLATE IDS
// ========================================
// 6 templates available on free: 2 angry, 2 funny, 1 savage, 1 professional
export const FREE_RAGE_TEMPLATE_IDS = new Set([
  'angry-1',    // Dark patterns complaint
  'angry-4',    // Phone call complaint
  'funny-1',    // Breakup comparison
  'funny-2',    // POV retention screens
  'savage-2',   // Public shame
  'pro-2',      // Advice/PSA
]);

// ========================================
// GATE CHECK FUNCTIONS
// ========================================

/**
 * Check if a rage template is available on free tier
 */
export function isRageTemplateFree(templateId: string): boolean {
  return FREE_RAGE_TEMPLATE_IDS.has(templateId);
}

/**
 * Check if countdown timer should show full live mode
 */
export function canUseFullTimers(isPremium: boolean): boolean {
  return isPremium;
}

/**
 * Check if guide auto-fill is available
 */
export function canUseGuideAutoFill(isPremium: boolean): boolean {
  return isPremium;
}

/**
 * Check if guide interactive checkboxes are available
 */
export function canUseGuideCheckboxes(isPremium: boolean): boolean {
  return isPremium;
}

/**
 * Check if user can edit rage templates inline
 */
export function canEditRageTemplates(isPremium: boolean): boolean {
  return isPremium;
}

/**
 * Check if premium share card features are available
 */
export function canUsePremiumShareCard(isPremium: boolean): boolean {
  return isPremium;
}

// ========================================
// UPGRADE PROMPT MESSAGES
// ========================================

export const UPGRADE_PROMPTS = {
  timers: {
    title: 'Live Countdown Timers',
    message: 'Upgrade to Pro for live pulsing timers with push notifications',
    emoji: '⏱️',
  },
  rageTemplates: {
    title: 'Full Rage Mode',
    message: 'Upgrade for all 16 templates, 4 tones, and inline editing',
    emoji: '🔥',
  },
  guideAutoFill: {
    title: 'Auto-Fill Guides',
    message: 'Upgrade to auto-fill cancellation details when adding subscriptions',
    emoji: '✨',
  },
  guideCheckboxes: {
    title: 'Interactive Guides',
    message: 'Upgrade to track your progress with step-by-step checkboxes',
    emoji: '☑️',
  },
  shareCard: {
    title: 'Premium Share Cards',
    message: 'Upgrade for custom gradients, badge embeds, and custom text',
    emoji: '🎨',
  },
  general: {
    title: 'Upgrade to Pro',
    message: 'Unlimited subscriptions, cloud sync, and premium features',
    emoji: '👑',
  },
} as const;
