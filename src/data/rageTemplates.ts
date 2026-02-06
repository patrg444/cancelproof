export type RageTone = 'angry' | 'funny' | 'savage' | 'professional';

export interface RageTemplate {
  id: string;
  tone: RageTone;
  template: string; // Uses {{serviceName}}, {{difficulty}}, {{savings}}, {{attempts}} placeholders
  category: string;
  emoji: string;
}

export const RAGE_TEMPLATES: RageTemplate[] = [
  // Angry
  {
    id: 'angry-1',
    tone: 'angry',
    template: 'It took me {{attempts}} attempts to cancel {{serviceName}}. {{difficulty}} difficulty rating. This should be illegal.',
    category: 'Dark patterns',
    emoji: '😡',
  },
  {
    id: 'angry-2',
    tone: 'angry',
    template: '{{serviceName}} made cancelling so hard I had to track it like a legal case. Kept my receipts. Saved {{savings}}/year.',
    category: 'Proof required',
    emoji: '🔥',
  },
  {
    id: 'angry-3',
    tone: 'angry',
    template: 'Just cancelled {{serviceName}} after they tried every trick in the book to keep me. {{difficulty}} difficulty. Never again.',
    category: 'Retention tricks',
    emoji: '💢',
  },
  {
    id: 'angry-4',
    tone: 'angry',
    template: 'Why does {{serviceName}} require a PHONE CALL to cancel in 2026? Rated {{difficulty}} to cancel. Absolute scam design.',
    category: 'Phone required',
    emoji: '📞',
  },

  // Funny
  {
    id: 'funny-1',
    tone: 'funny',
    template: 'Cancelling {{serviceName}} was harder than my last breakup. At least my ex let me leave without a 45-minute retention call.',
    category: 'Retention calls',
    emoji: '💔',
  },
  {
    id: 'funny-2',
    tone: 'funny',
    template: 'POV: You try to cancel {{serviceName}} and they hit you with 7 "are you sure?" screens, 3 discount offers, and a guilt trip.',
    category: 'Dark patterns',
    emoji: '🎭',
  },
  {
    id: 'funny-3',
    tone: 'funny',
    template: 'Spent more time trying to cancel {{serviceName}} than I ever spent using it. Saving {{savings}}/year was worth the trauma.',
    category: 'Wasted time',
    emoji: '⏰',
  },
  {
    id: 'funny-4',
    tone: 'funny',
    template: 'My {{serviceName}} cancellation story should be a Netflix documentary. Oh wait, Netflix is actually easy to cancel. 1/5 difficulty.',
    category: 'Comparison',
    emoji: '🎬',
  },

  // Savage
  {
    id: 'savage-1',
    tone: 'savage',
    template: '{{serviceName}}: making it easy to sign up, impossible to leave since day one. {{difficulty}} cancellation difficulty. I rated it so you don\'t have to.',
    category: 'Easy in, hard out',
    emoji: '⚔️',
  },
  {
    id: 'savage-2',
    tone: 'savage',
    template: 'Companies that make cancellation hard deserve to be publicly shamed. Starting with {{serviceName}}. {{difficulty}} difficulty. You\'re welcome.',
    category: 'Public shame',
    emoji: '📢',
  },
  {
    id: 'savage-3',
    tone: 'savage',
    template: 'Cancelled {{serviceName}} and saved {{savings}}/year. They made it {{difficulty}} to cancel but I came prepared with screenshots and confirmation numbers.',
    category: 'Victory lap',
    emoji: '🏆',
  },
  {
    id: 'savage-4',
    tone: 'savage',
    template: 'Day 1: Try to cancel {{serviceName}}. Day 3: Still trying. Day 7: Finally free. The {{difficulty}} rating is real.',
    category: 'Timeline',
    emoji: '📅',
  },

  // Professional
  {
    id: 'pro-1',
    tone: 'professional',
    template: 'I documented my {{serviceName}} cancellation process. It took {{attempts}} steps and rated {{difficulty}} for difficulty. Consumers deserve better.',
    category: 'Documentation',
    emoji: '📋',
  },
  {
    id: 'pro-2',
    tone: 'professional',
    template: 'Cancelled {{serviceName}} today. If you\'re thinking about it: save your confirmation emails, screenshot everything, and track your proof. Saving {{savings}}/year.',
    category: 'Advice',
    emoji: '💡',
  },
  {
    id: 'pro-3',
    tone: 'professional',
    template: 'PSA: {{serviceName}} cancellation is rated {{difficulty}}. Here\'s what worked for me: keep records, follow up, and don\'t accept the first "no."',
    category: 'PSA',
    emoji: '🔔',
  },
  {
    id: 'pro-4',
    tone: 'professional',
    template: 'Just saved {{savings}}/year by auditing my subscriptions with CancelMem. {{serviceName}} was the hardest to cancel at {{difficulty}} difficulty.',
    category: 'Results',
    emoji: '📊',
  },
];

export const TONE_LABELS: Record<RageTone, { label: string; emoji: string; color: string }> = {
  angry: { label: 'Angry', emoji: '😡', color: 'text-red-600 dark:text-red-400' },
  funny: { label: 'Funny', emoji: '😂', color: 'text-yellow-600 dark:text-yellow-400' },
  savage: { label: 'Savage', emoji: '⚔️', color: 'text-purple-600 dark:text-purple-400' },
  professional: { label: 'Professional', emoji: '📋', color: 'text-blue-600 dark:text-blue-400' },
};

export function fillTemplate(
  template: string,
  data: {
    serviceName?: string;
    difficulty?: string;
    savings?: string;
    attempts?: string;
  }
): string {
  let result = template;
  if (data.serviceName) result = result.replace(/\{\{serviceName\}\}/g, data.serviceName);
  if (data.difficulty) result = result.replace(/\{\{difficulty\}\}/g, data.difficulty);
  if (data.savings) result = result.replace(/\{\{savings\}\}/g, data.savings);
  if (data.attempts) result = result.replace(/\{\{attempts\}\}/g, data.attempts);
  return result;
}
