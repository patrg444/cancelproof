import { CancellationMethod, SubscriptionCategory, CancellationDifficulty } from '@/types/subscription';

export interface GuideStep {
  number: number;
  title: string;
  description: string;
  action?: string; // Specific clickable action
  warning?: string; // Dark pattern warning
  tip?: string; // Helpful tip
}

export interface CancellationGuide {
  id: string;
  serviceName: string;
  aliases: string[]; // Alternative names to match
  category: SubscriptionCategory;
  difficulty: CancellationDifficulty;
  method: CancellationMethod;
  cancellationUrl: string;
  estimatedTime: string; // "2 minutes", "5-10 minutes"
  steps: GuideStep[];
  supportContact?: string;
  requiredInfo?: string;
  cancelByRule: 'anytime' | '1-day-before' | '3-days-before' | '7-days-before' | 'end-of-period';
  cancelByNotes?: string;
  darkPatterns?: string[]; // Warning about manipulation tactics
  tips?: string[];
  billingPeriod?: 'monthly' | 'yearly' | 'quarterly' | 'weekly';
  amount?: number; // Typical price
  lastVerified: string; // Date the guide was last checked
}

export const cancellationGuides: CancellationGuide[] = [
  {
    id: 'netflix',
    serviceName: 'Netflix',
    aliases: ['netflix', 'netflix premium', 'netflix standard', 'netflix basic'],
    category: 'streaming',
    difficulty: 1,
    method: 'web',
    cancellationUrl: 'https://www.netflix.com/cancelplan',
    estimatedTime: '2 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Account',
        description: 'Sign in to netflix.com and click your profile icon in the top right, then select "Account".',
        action: 'Click profile icon > Account',
      },
      {
        number: 2,
        title: 'Click Cancel Membership',
        description: 'Scroll down to the "Plan Details" section and click "Cancel Membership".',
        action: 'Click "Cancel Membership"',
      },
      {
        number: 3,
        title: 'Confirm Cancellation',
        description: 'Click "Finish Cancellation" on the confirmation page. You\'ll keep access until the end of your billing period.',
        action: 'Click "Finish Cancellation"',
        tip: 'Screenshot this confirmation page for your records!',
      },
    ],
    cancelByRule: 'anytime',
    cancelByNotes: 'Can cancel anytime; access continues until end of billing period',
    tips: [
      'You keep access until the end of your current billing period',
      'Your viewing history and preferences are saved for 10 months if you rejoin',
    ],
    amount: 15.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-12-01',
  },
  {
    id: 'spotify',
    serviceName: 'Spotify Premium',
    aliases: ['spotify', 'spotify premium', 'spotify family', 'spotify duo', 'spotify student'],
    category: 'streaming',
    difficulty: 1,
    method: 'web',
    cancellationUrl: 'https://www.spotify.com/us/account/subscription/',
    estimatedTime: '2 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Subscription',
        description: 'Sign in to spotify.com/account and navigate to the "Your plan" section.',
        action: 'Go to Account > Your Plan',
      },
      {
        number: 2,
        title: 'Click Change Plan',
        description: 'Click "Change plan" and then select "Cancel Premium".',
        action: 'Click "Cancel Premium"',
      },
      {
        number: 3,
        title: 'Confirm',
        description: 'Follow the prompts. Spotify will try to offer you a discount or downgrade. Click through to confirm cancellation.',
        action: 'Confirm cancellation',
        warning: 'Spotify may show retention offers - stay firm if you want to cancel',
        tip: 'You revert to the free tier with ads at the end of your billing period',
      },
    ],
    cancelByRule: 'anytime',
    cancelByNotes: 'Can cancel anytime; reverts to free plan at end of period',
    tips: [
      'You keep Premium until the end of your billing period',
      'Your playlists and saved music are preserved on the free tier',
    ],
    amount: 10.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-12-01',
  },
  {
    id: 'adobe',
    serviceName: 'Adobe Creative Cloud',
    aliases: ['adobe', 'adobe cc', 'creative cloud', 'adobe creative cloud', 'photoshop', 'lightroom', 'adobe photoshop', 'adobe illustrator'],
    category: 'software',
    difficulty: 4,
    method: 'web',
    cancellationUrl: 'https://account.adobe.com/',
    estimatedTime: '10-15 minutes',
    steps: [
      {
        number: 1,
        title: 'Sign in to Adobe Account',
        description: 'Go to account.adobe.com and sign in with your Adobe ID.',
        action: 'Sign in at account.adobe.com',
      },
      {
        number: 2,
        title: 'Go to Plans',
        description: 'Click on "Plans" or "Manage plan" in your account dashboard.',
        action: 'Click "Plans" or "Manage plan"',
      },
      {
        number: 3,
        title: 'Select Cancel Plan',
        description: 'Find your plan and click "Cancel plan". Adobe will start the cancellation wizard.',
        action: 'Click "Cancel plan"',
        warning: 'Adobe uses a multi-step retention flow with offers and surveys',
      },
      {
        number: 4,
        title: 'Navigate Retention Offers',
        description: 'You\'ll see discount offers, pause options, and "reasons for leaving" surveys. Click through ALL of them to proceed.',
        warning: 'There may be 3-5 screens of retention offers. Keep clicking "No thanks" or "Continue"',
        tip: 'Do NOT accept a "pause" if you want to fully cancel',
      },
      {
        number: 5,
        title: 'Accept Early Termination Fee (if annual)',
        description: 'If on an annual plan, you may owe an early termination fee (50% of remaining months). Review and confirm.',
        warning: 'Annual plans have early termination fees! Consider waiting until renewal date',
        tip: 'Switch to monthly billing first to avoid ETF, then cancel after 1 month',
      },
      {
        number: 6,
        title: 'Confirm and Screenshot',
        description: 'Click the final "Confirm cancellation" button. Immediately screenshot the confirmation page and save the confirmation email.',
        action: 'Click "Confirm" and take screenshot',
        tip: 'Save the confirmation email as proof - Adobe has been known to continue billing',
      },
    ],
    supportContact: '1-800-833-6687',
    cancelByRule: '3-days-before',
    cancelByNotes: 'Cancel 3+ days before renewal to avoid being charged',
    darkPatterns: [
      'Multi-step retention wizard with 3-5 offers to stay',
      'Early termination fees on annual plans (50% of remaining months)',
      '"Pause" option can accidentally restart',
      'Confusing plan names make it hard to know what you\'re cancelling',
    ],
    tips: [
      'If on annual plan, wait until close to renewal to minimize ETF',
      'Chat support may offer better deals than the web flow',
      'Download all your files before cancelling - cloud storage is removed',
    ],
    amount: 54.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-15',
  },
  {
    id: 'amazon-prime',
    serviceName: 'Amazon Prime',
    aliases: ['amazon prime', 'prime', 'amazon', 'prime video'],
    category: 'other',
    difficulty: 2,
    method: 'web',
    cancellationUrl: 'https://www.amazon.com/gp/help/customer/display.html?nodeId=201118010',
    estimatedTime: '3 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Prime Membership',
        description: 'Sign in to Amazon and go to Account > Prime Membership.',
        action: 'Account > Prime Membership',
      },
      {
        number: 2,
        title: 'Click End Membership',
        description: 'Click "Update, cancel and more" then "End Membership".',
        action: 'Click "End Membership"',
      },
      {
        number: 3,
        title: 'Navigate Retention Screen',
        description: 'Amazon will show what you\'ll lose. Click "Continue to cancel" through multiple screens.',
        action: 'Click "Continue to cancel"',
        warning: 'Amazon shows 2-3 retention screens highlighting benefits you\'ll lose',
      },
      {
        number: 4,
        title: 'Confirm',
        description: 'Select your end date preference and confirm. You may be eligible for a prorated refund.',
        tip: 'If you haven\'t used Prime benefits recently, you may get a full refund',
      },
    ],
    supportContact: '1-888-280-4331',
    cancelByRule: 'anytime',
    cancelByNotes: 'Can cancel anytime; prorated refund may be available',
    tips: [
      'You may get a prorated refund if you haven\'t used Prime recently',
      'Prime Video, Music, and Reading all stop when membership ends',
    ],
    amount: 139.00,
    billingPeriod: 'yearly',
    lastVerified: '2025-12-01',
  },
  {
    id: 'hulu',
    serviceName: 'Hulu',
    aliases: ['hulu', 'hulu plus', 'hulu live', 'hulu no ads'],
    category: 'streaming',
    difficulty: 2,
    method: 'web',
    cancellationUrl: 'https://secure.hulu.com/account',
    estimatedTime: '2 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Account Page',
        description: 'Sign in to hulu.com and navigate to your Account page.',
        action: 'Go to Account',
      },
      {
        number: 2,
        title: 'Click Cancel',
        description: 'Click "Cancel" next to your subscription plan.',
        action: 'Click "Cancel"',
      },
      {
        number: 3,
        title: 'Decline Offers and Confirm',
        description: 'Hulu will offer a pause or plan switch. Decline and confirm cancellation.',
        action: 'Confirm cancellation',
        warning: 'They may offer to pause your account instead - choose cancel if that\'s your intent',
      },
    ],
    cancelByRule: 'anytime',
    cancelByNotes: 'Cancel anytime; access until end of billing period',
    tips: [
      'If billed through Disney+ bundle, cancel through Disney+ instead',
      'Access continues until end of current billing period',
    ],
    amount: 17.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-01',
  },
  {
    id: 'disney-plus',
    serviceName: 'Disney+',
    aliases: ['disney+', 'disney plus', 'disneyplus'],
    category: 'streaming',
    difficulty: 1,
    method: 'web',
    cancellationUrl: 'https://www.disneyplus.com/account',
    estimatedTime: '2 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Account',
        description: 'Sign in and go to your Account settings.',
        action: 'Account > Subscription',
      },
      {
        number: 2,
        title: 'Select Cancel Subscription',
        description: 'Click your subscription plan, then "Cancel Subscription".',
        action: 'Click "Cancel Subscription"',
      },
      {
        number: 3,
        title: 'Confirm',
        description: 'Complete the cancellation survey and confirm.',
        action: 'Confirm cancellation',
      },
    ],
    cancelByRule: 'anytime',
    amount: 13.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-01',
  },
  {
    id: 'planet-fitness',
    serviceName: 'Planet Fitness',
    aliases: ['planet fitness', 'pf', 'planet fitness gym'],
    category: 'fitness',
    difficulty: 5,
    method: 'email',
    cancellationUrl: 'mailto:support@planetfitness.com',
    estimatedTime: '15-30 minutes + waiting',
    steps: [
      {
        number: 1,
        title: 'Check Your Contract',
        description: 'Review your membership agreement for the specific cancellation policy. Most require written notice.',
        tip: 'Some locations require a certified letter or in-person visit',
      },
      {
        number: 2,
        title: 'Visit In Person OR Send Letter',
        description: 'Go to your home gym and fill out a cancellation form, OR send a certified letter to your gym\'s address.',
        warning: 'Online cancellation is NOT available for most locations',
        tip: 'Certified mail with return receipt gives you proof of delivery',
      },
      {
        number: 3,
        title: 'Include Required Information',
        description: 'Include your full name, address, date of birth, membership number, and a clear statement requesting cancellation.',
        action: 'Fill out form with all required info',
      },
      {
        number: 4,
        title: 'Get Written Confirmation',
        description: 'Request a written confirmation of your cancellation. If in person, get a printed receipt. If by mail, keep tracking info.',
        tip: 'Take photos/screenshots of everything!',
        warning: 'They may try to convince you to "freeze" instead of cancel',
      },
      {
        number: 5,
        title: 'Watch for Final Charges',
        description: 'Check your bank statements for 2-3 months after cancellation. Annual fees may still apply if near the charge date.',
        warning: 'Planet Fitness charges annual fees regardless of cancellation timing in some contracts',
      },
    ],
    requiredInfo: 'Full name, address, date of birth, membership number, email on file',
    supportContact: 'Contact your home gym directly',
    cancelByRule: '1-day-before',
    cancelByNotes: 'Must submit cancellation before billing date; some locations require notice before the 10th of the month',
    darkPatterns: [
      'No online cancellation option',
      'Requires in-person visit or certified letter',
      'Annual fee charged even if you\'re cancelling',
      'Staff may pressure you to "freeze" instead',
      'Cancellation only effective at your "home gym"',
    ],
    tips: [
      'Send certified mail with return receipt for proof',
      'Take photos of any in-person cancellation forms',
      'Set up alerts on your bank account to catch unexpected charges',
    ],
    amount: 24.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-10-15',
  },
  {
    id: 'nytimes',
    serviceName: 'The New York Times',
    aliases: ['nytimes', 'new york times', 'nyt', 'ny times'],
    category: 'news',
    difficulty: 3,
    method: 'web',
    cancellationUrl: 'https://myaccount.nytimes.com/seg/settings',
    estimatedTime: '5 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Account Settings',
        description: 'Sign in to myaccount.nytimes.com and go to your subscription settings.',
        action: 'myaccount.nytimes.com > Settings',
      },
      {
        number: 2,
        title: 'Click Manage Subscription',
        description: 'Find the "Manage subscription" or "Subscription overview" link.',
        action: 'Click "Manage Subscription"',
      },
      {
        number: 3,
        title: 'Click Cancel Subscription',
        description: 'Look for the "Cancel" option. It may be buried in a submenu.',
        action: 'Click "Cancel"',
        warning: 'The cancel button is intentionally hard to find - look in the fine print',
      },
      {
        number: 4,
        title: 'Navigate Retention Offers',
        description: 'They will offer discounts and reduced plans. Decline all offers to proceed.',
        warning: 'Expect 2-3 screens of "special offers" before you can actually cancel',
      },
      {
        number: 5,
        title: 'Confirm and Screenshot',
        description: 'Confirm cancellation and take a screenshot of the confirmation page.',
        action: 'Confirm and screenshot',
        tip: 'Save the confirmation email as proof',
      },
    ],
    supportContact: '1-800-698-4637',
    cancelByRule: 'end-of-period',
    cancelByNotes: 'Effective at end of current billing period',
    darkPatterns: [
      'Cancel button is hard to find',
      'Multiple retention offer screens',
      'May require calling support for some plan types',
    ],
    amount: 17.00,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-01',
  },
  {
    id: 'chatgpt',
    serviceName: 'ChatGPT Plus',
    aliases: ['chatgpt', 'chatgpt plus', 'openai', 'chatgpt pro', 'gpt plus'],
    category: 'software',
    difficulty: 1,
    method: 'web',
    cancellationUrl: 'https://chat.openai.com/#settings/subscription',
    estimatedTime: '1 minute',
    steps: [
      {
        number: 1,
        title: 'Open Settings',
        description: 'Click your profile icon in the bottom-left, then click "My Plan".',
        action: 'Profile > My Plan',
      },
      {
        number: 2,
        title: 'Click Manage Subscription',
        description: 'Click "Manage my subscription" which opens the billing portal.',
        action: 'Click "Manage my subscription"',
      },
      {
        number: 3,
        title: 'Cancel Plan',
        description: 'Click "Cancel plan" and confirm. You keep access until the end of your billing period.',
        action: 'Click "Cancel plan"',
      },
    ],
    cancelByRule: 'anytime',
    cancelByNotes: 'Cancel anytime; access until end of billing period',
    tips: [
      'Your conversations and history are preserved',
      'You revert to the free tier with usage limits',
    ],
    amount: 20.00,
    billingPeriod: 'monthly',
    lastVerified: '2025-12-01',
  },
  {
    id: 'apple-music',
    serviceName: 'Apple Music',
    aliases: ['apple music', 'apple one', 'itunes'],
    category: 'streaming',
    difficulty: 1,
    method: 'app-store',
    cancellationUrl: 'https://support.apple.com/en-us/HT202039',
    estimatedTime: '2 minutes',
    steps: [
      {
        number: 1,
        title: 'Open Settings on iPhone',
        description: 'Open the Settings app on your iPhone or iPad.',
        action: 'Settings > [Your Name]',
      },
      {
        number: 2,
        title: 'Go to Subscriptions',
        description: 'Tap your name at the top, then tap "Subscriptions".',
        action: 'Tap "Subscriptions"',
      },
      {
        number: 3,
        title: 'Select Apple Music',
        description: 'Tap on your Apple Music subscription.',
        action: 'Tap Apple Music',
      },
      {
        number: 4,
        title: 'Cancel Subscription',
        description: 'Tap "Cancel Subscription" and confirm.',
        action: 'Tap "Cancel Subscription"',
      },
    ],
    cancelByRule: 'anytime',
    tips: [
      'Can also cancel via App Store > Profile > Subscriptions on Mac',
      'Your music library is preserved but downloaded songs become unavailable',
    ],
    amount: 10.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-12-01',
  },
  {
    id: 'youtube-premium',
    serviceName: 'YouTube Premium',
    aliases: ['youtube premium', 'youtube', 'yt premium', 'youtube music'],
    category: 'streaming',
    difficulty: 1,
    method: 'web',
    cancellationUrl: 'https://www.youtube.com/paid_memberships',
    estimatedTime: '2 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Paid Memberships',
        description: 'Sign in and go to youtube.com/paid_memberships.',
        action: 'youtube.com/paid_memberships',
      },
      {
        number: 2,
        title: 'Click Manage Membership',
        description: 'Click "Manage membership" next to YouTube Premium.',
        action: 'Click "Manage membership"',
      },
      {
        number: 3,
        title: 'Cancel and Confirm',
        description: 'Click "Deactivate" or "Cancel" and confirm. You keep access until the end of your billing period.',
        action: 'Click "Cancel"',
      },
    ],
    cancelByRule: 'anytime',
    amount: 13.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-12-01',
  },
  {
    id: 'xbox-game-pass',
    serviceName: 'Xbox Game Pass',
    aliases: ['xbox game pass', 'game pass', 'xbox', 'gamepass', 'xbox game pass ultimate'],
    category: 'gaming',
    difficulty: 2,
    method: 'web',
    cancellationUrl: 'https://account.microsoft.com/services',
    estimatedTime: '3 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Microsoft Services',
        description: 'Sign in to account.microsoft.com/services.',
        action: 'account.microsoft.com/services',
      },
      {
        number: 2,
        title: 'Find Game Pass',
        description: 'Find your Game Pass subscription and click "Manage".',
        action: 'Click "Manage"',
      },
      {
        number: 3,
        title: 'Turn Off Recurring Billing',
        description: 'Click "Turn off recurring billing" to cancel auto-renewal.',
        action: 'Turn off recurring billing',
      },
      {
        number: 4,
        title: 'Confirm Cancellation',
        description: 'Confirm and your subscription will end at the end of the current period.',
        action: 'Confirm',
      },
    ],
    cancelByRule: 'anytime',
    amount: 16.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-15',
  },
  {
    id: 'peloton',
    serviceName: 'Peloton',
    aliases: ['peloton', 'peloton all-access', 'peloton app', 'peloton digital'],
    category: 'fitness',
    difficulty: 3,
    method: 'web',
    cancellationUrl: 'https://members.onepeloton.com/preferences/subscriptions',
    estimatedTime: '5 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Subscription Settings',
        description: 'Sign in to members.onepeloton.com and go to Preferences > Subscriptions.',
        action: 'Preferences > Subscriptions',
      },
      {
        number: 2,
        title: 'Select Cancel Membership',
        description: 'Click "Cancel Membership" at the bottom of the page.',
        action: 'Click "Cancel Membership"',
        warning: 'The cancel option may be at the very bottom of the page',
      },
      {
        number: 3,
        title: 'Navigate Retention Flow',
        description: 'Peloton will offer discounts and pauses. Decline to proceed to actual cancellation.',
        warning: 'Multiple retention screens with special offers',
      },
      {
        number: 4,
        title: 'Confirm',
        description: 'Complete the survey and confirm cancellation. Screenshot the confirmation.',
        action: 'Confirm and screenshot',
      },
    ],
    supportContact: 'support@onepeloton.com',
    cancelByRule: '1-day-before',
    cancelByNotes: 'Cancel before next billing date',
    darkPatterns: [
      'Cancel button is at the very bottom of the page',
      'Multiple retention offers and discounts',
    ],
    amount: 44.00,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-01',
  },
  {
    id: 'hellofresh',
    serviceName: 'HelloFresh',
    aliases: ['hellofresh', 'hello fresh'],
    category: 'other',
    difficulty: 4,
    method: 'web',
    cancellationUrl: 'https://www.hellofresh.com/my-deliveries',
    estimatedTime: '10 minutes',
    steps: [
      {
        number: 1,
        title: 'Sign In',
        description: 'Go to hellofresh.com and sign in to your account.',
        action: 'Sign in at hellofresh.com',
      },
      {
        number: 2,
        title: 'Go to Account Settings',
        description: 'Click your name, then "Account Settings", then "Plan Settings".',
        action: 'Account Settings > Plan Settings',
      },
      {
        number: 3,
        title: 'Scroll to Cancel',
        description: 'Scroll to the very bottom and click "Cancel Plan".',
        action: 'Click "Cancel Plan"',
        warning: 'The cancel link is at the very bottom in small text',
      },
      {
        number: 4,
        title: 'Navigate Survey and Offers',
        description: 'Complete their lengthy "why are you leaving" survey and decline all retention offers.',
        warning: 'Expect 4-6 screens of retention offers including free boxes and discounts',
      },
      {
        number: 5,
        title: 'Confirm Cancellation',
        description: 'Find and click the final confirmation button. Screenshot immediately.',
        action: 'Confirm and screenshot',
        tip: 'Check that upcoming boxes are actually cancelled too',
      },
    ],
    supportContact: 'help@hellofresh.com',
    cancelByRule: '7-days-before',
    cancelByNotes: 'Must cancel 5+ days before next delivery date',
    darkPatterns: [
      'Cancel button hidden at page bottom in small text',
      '4-6 screens of retention offers',
      'Skip vs Cancel confusion - skipping is NOT cancelling',
      'Must cancel each week\'s box separately from the subscription',
    ],
    tips: [
      'Skip all upcoming deliveries first, then cancel the subscription',
      'Skipping a box is NOT the same as cancelling',
    ],
    amount: 11.99,
    billingPeriod: 'weekly',
    lastVerified: '2025-11-15',
  },
  {
    id: 'linkedin-premium',
    serviceName: 'LinkedIn Premium',
    aliases: ['linkedin premium', 'linkedin', 'linkedin learning'],
    category: 'productivity',
    difficulty: 2,
    method: 'web',
    cancellationUrl: 'https://www.linkedin.com/psettings/cancel-premium',
    estimatedTime: '3 minutes',
    steps: [
      {
        number: 1,
        title: 'Go to Premium Settings',
        description: 'Sign in to LinkedIn and go to Settings > Account > Manage Premium account.',
        action: 'Settings > Account > Manage Premium',
      },
      {
        number: 2,
        title: 'Cancel Subscription',
        description: 'Click "Cancel subscription" and select a reason.',
        action: 'Click "Cancel subscription"',
      },
      {
        number: 3,
        title: 'Confirm',
        description: 'Decline any offers and confirm cancellation.',
        action: 'Confirm cancellation',
      },
    ],
    cancelByRule: 'anytime',
    amount: 29.99,
    billingPeriod: 'monthly',
    lastVerified: '2025-11-01',
  },
];

/**
 * Find a matching cancellation guide by service name
 * Uses fuzzy matching against serviceName and aliases
 */
export function findGuideByName(name: string): CancellationGuide | null {
  if (!name || name.trim().length < 2) return null;

  const normalized = name.toLowerCase().trim();

  // Exact match first
  const exact = cancellationGuides.find(
    g => g.serviceName.toLowerCase() === normalized ||
         g.aliases.some(a => a === normalized)
  );
  if (exact) return exact;

  // Partial match
  const partial = cancellationGuides.find(
    g => g.serviceName.toLowerCase().includes(normalized) ||
         normalized.includes(g.serviceName.toLowerCase()) ||
         g.aliases.some(a => a.includes(normalized) || normalized.includes(a))
  );
  if (partial) return partial;

  return null;
}

/**
 * Get all guides sorted by difficulty (hardest first - most viral)
 */
export function getGuidesByDifficulty(): CancellationGuide[] {
  return [...cancellationGuides].sort((a, b) => b.difficulty - a.difficulty);
}

/**
 * Get guides by category
 */
export function getGuidesByCategory(category: SubscriptionCategory): CancellationGuide[] {
  return cancellationGuides.filter(g => g.category === category);
}
