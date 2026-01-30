import { Subscription, BillingPeriod } from '@/types/subscription';
import { format, differenceInDays, addMonths, addYears, addWeeks, parseISO } from 'date-fns';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}

export function calculateMonthlyEquivalent(amount: number, period: BillingPeriod): number {
  switch (period) {
    case 'weekly':
      return amount * 4.33; // Average weeks per month
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    case 'one-time':
      return 0;
    default:
      return amount;
  }
}

export function getDaysUntilRenewal(subscription: Subscription): number;
export function getDaysUntilRenewal(renewalDate: string): number;
export function getDaysUntilRenewal(input: Subscription | string): number {
  try {
    const renewalDate = typeof input === 'string' ? input : input.renewalDate;
    const renewal = parseISO(renewalDate);
    const today = new Date();
    return differenceInDays(renewal, today);
  } catch {
    return 0;
  }
}

export function getNextRenewalDate(renewalDate: string, period: BillingPeriod): string {
  try {
    const date = parseISO(renewalDate);
    const today = new Date();
    
    if (date > today) {
      return renewalDate;
    }
    
    let nextDate = date;
    while (nextDate <= today) {
      switch (period) {
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
        case 'quarterly':
          nextDate = addMonths(nextDate, 3);
          break;
        case 'yearly':
          nextDate = addYears(nextDate, 1);
          break;
        default:
          return renewalDate;
      }
    }
    
    return format(nextDate, 'yyyy-MM-dd');
  } catch {
    return renewalDate;
  }
}

export function getRenewalStatus(subscription: Subscription): {
  status: 'urgent' | 'soon' | 'upcoming' | 'future';
  label: string;
  daysUntil: number;
} {
  const daysUntil = getDaysUntilRenewal(subscription.renewalDate);
  
  if (daysUntil < 0) {
    return { status: 'urgent', label: 'Overdue', daysUntil };
  } else if (daysUntil === 0) {
    return { status: 'urgent', label: 'Today', daysUntil };
  } else if (daysUntil === 1) {
    return { status: 'urgent', label: 'Tomorrow', daysUntil };
  } else if (daysUntil <= 3) {
    return { status: 'soon', label: `${daysUntil} days`, daysUntil };
  } else if (daysUntil <= 7) {
    return { status: 'upcoming', label: `${daysUntil} days`, daysUntil };
  } else {
    return { status: 'future', label: format(parseISO(subscription.renewalDate), 'MMM d'), daysUntil };
  }
}

export function calculateTotalMonthlySpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((total, sub) => {
      return total + calculateMonthlyEquivalent(sub.amount, sub.billingPeriod);
    }, 0);
}

export function getUpcomingRenewals(subscriptions: Subscription[], days: number = 7): Subscription[] {
  return subscriptions
    .filter(s => s.status === 'active')
    .filter(s => {
      const daysUntil = getDaysUntilRenewal(s.renewalDate);
      return daysUntil >= 0 && daysUntil <= days;
    })
    .sort((a, b) => getDaysUntilRenewal(a.renewalDate) - getDaysUntilRenewal(b.renewalDate));
}

export function getTrialsEndingSoon(subscriptions: Subscription[], days: number = 7): Subscription[] {
  return subscriptions
    .filter(s => s.status === 'trial' && s.trialEndDate)
    .filter(s => {
      const daysUntil = getDaysUntilRenewal(s.trialEndDate!);
      return daysUntil >= 0 && daysUntil <= days;
    })
    .sort((a, b) => getDaysUntilRenewal(a.trialEndDate!) - getDaysUntilRenewal(b.trialEndDate!));
}

export function exportToCSV(subscriptions: Subscription[]): string {
  const headers = [
    'Name',
    'Amount',
    'Currency',
    'Monthly Equivalent',
    'Billing Period',
    'Cancel By Date',
    'Renewal Date',
    'Status',
    'Proof Status',
    'Proof Count',
    'Category',
    'Cancellation Method',
    'Cancellation URL',
    'Notes'
  ];
  
  const rows = subscriptions.map(sub => [
    sub.name,
    sub.amount.toString(),
    sub.currency,
    calculateMonthlyEquivalent(sub.amount, sub.billingPeriod).toFixed(2),
    sub.billingPeriod,
    sub.cancelByDate,
    sub.renewalDate,
    sub.status,
    sub.proofStatus,
    sub.proofDocuments.length.toString(),
    sub.category || '',
    sub.cancellationMethod,
    sub.cancellationUrl || '',
    sub.notes || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `\"${cell}\"`).join(','))
  ].join('\n');
  
  return csvContent;
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}