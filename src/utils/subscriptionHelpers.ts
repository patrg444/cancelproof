import { Subscription, CancelByRule, SubscriptionIntent } from '@/types/subscription';

/**
 * Computes the cancel-by deadline based on the rule and renewal date
 */
export function computeCancelByDate(
  renewalDate: string,
  cancelByRule: CancelByRule,
  customDate?: string
): string {
  if (cancelByRule === 'custom' && customDate) {
    return customDate;
  }

  if (cancelByRule === 'anytime') {
    // No deadline - return far future date
    return new Date('2099-12-31').toISOString().split('T')[0];
  }

  const renewal = new Date(renewalDate);
  
  switch (cancelByRule) {
    case '1-day-before': {
      const deadline = new Date(renewal);
      deadline.setDate(deadline.getDate() - 1);
      return deadline.toISOString().split('T')[0];
    }
    case '3-days-before': {
      const deadline = new Date(renewal);
      deadline.setDate(deadline.getDate() - 3);
      return deadline.toISOString().split('T')[0];
    }
    case '7-days-before': {
      const deadline = new Date(renewal);
      deadline.setDate(deadline.getDate() - 7);
      return deadline.toISOString().split('T')[0];
    }
    case 'end-of-period': {
      // Same as renewal date
      return renewalDate;
    }
    default:
      return renewalDate;
  }
}

/**
 * Gets a human-readable label for the cancel-by rule
 */
export function getCancelByRuleLabel(rule: CancelByRule): string {
  switch (rule) {
    case 'anytime':
      return 'Anytime';
    case '1-day-before':
      return '1 day before renewal';
    case '3-days-before':
      return '3 days before renewal';
    case '7-days-before':
      return '7 days before renewal';
    case 'end-of-period':
      return 'End of billing period';
    case 'custom':
      return 'Custom date';
    default:
      return 'Unknown';
  }
}

/**
 * Determines proof status based on subscription state
 */
export function getProofStatus(
  status: Subscription['status'],
  proofDocuments: Subscription['proofDocuments']
): Subscription['proofStatus'] {
  // Proof is only relevant after cancellation attempt or cancellation
  if (status === 'active' || status === 'trial') {
    return 'not-required';
  }

  // For cancel-attempted or cancelled, check proof documents
  if (proofDocuments.length === 0) {
    return 'missing';
  }

  // Check if we have at least one substantive proof
  const hasSubstantiveProof = proofDocuments.some(
    doc => doc.type === 'screenshot' || doc.type === 'email' || doc.type === 'pdf'
  );

  return hasSubstantiveProof ? 'complete' : 'incomplete';
}

/**
 * Gets default reminder settings based on intent
 */
export function getDefaultReminders(intent: SubscriptionIntent): {
  sevenDays: boolean;
  threeDays: boolean;
  oneDay: boolean;
  dayOf: boolean;
} {
  switch (intent) {
    case 'keep':
      // Minimal reminders for subscriptions they want to keep
      return {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
        dayOf: false,
      };
    case 'trial':
      // Full reminder sequence for trials
      return {
        sevenDays: true,
        threeDays: true,
        oneDay: true,
        dayOf: true,
      };
    case 'cancel-soon':
      // Aggressive reminders for planned cancellations
      return {
        sevenDays: true,
        threeDays: true,
        oneDay: true,
        dayOf: true,
      };
    default:
      return {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
        dayOf: false,
      };
  }
}

/**
 * Gets default cancel-by rule based on intent
 */
export function getDefaultCancelByRule(intent: SubscriptionIntent): CancelByRule {
  switch (intent) {
    case 'keep':
      return 'anytime';
    case 'trial':
      return '1-day-before';
    case 'cancel-soon':
      return '3-days-before';
    default:
      return 'anytime';
  }
}

/**
 * Calculates days until cancel-by deadline
 */
export function getDaysUntilCancelBy(cancelByDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(cancelByDate);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Determines if a subscription needs urgent action
 */
export function isUrgent(subscription: Subscription): boolean {
  const daysUntil = getDaysUntilCancelBy(subscription.cancelByDate);
  
  // Urgent if cancel-by is within 3 days and not yet cancelled
  if (subscription.status === 'active' || subscription.status === 'trial') {
    return daysUntil <= 3 && subscription.intent !== 'keep';
  }
  
  // Also urgent if cancelled but missing proof
  if (subscription.status === 'cancelled' || subscription.status === 'cancel-attempted') {
    return subscription.proofStatus === 'missing' || subscription.proofStatus === 'incomplete';
  }
  
  return false;
}

/**
 * Gets the intent label
 */
export function getIntentLabel(intent: SubscriptionIntent): string {
  switch (intent) {
    case 'keep':
      return 'Keep';
    case 'trial':
      return 'Trial (plan to cancel)';
    case 'cancel-soon':
      return 'Cancel before renewal';
    default:
      return 'Unknown';
  }
}
