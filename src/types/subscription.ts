export type BillingPeriod = 'monthly' | 'yearly' | 'quarterly' | 'weekly' | 'one-time';

export type CancellationMethod = 'app-store' | 'google-play' | 'web' | 'email' | 'phone';

export type SubscriptionCategory = 
  | 'streaming'
  | 'software'
  | 'fitness'
  | 'productivity'
  | 'news'
  | 'gaming'
  | 'other';

// User's intent for the subscription
export type SubscriptionIntent = 'keep' | 'trial' | 'cancel-soon';

// Cancel-by rule type - defines how the cancel-by deadline is computed
export type CancelByRule = 
  | 'anytime'           // Can cancel anytime, no deadline
  | '1-day-before'      // Must cancel 1 day before renewal
  | '3-days-before'     // Must cancel 3 days before renewal
  | '7-days-before'     // Must cancel 7 days before renewal
  | 'end-of-period'     // Cancel by end of current period
  | 'custom';           // Custom date set by user

export type TimelineEventType = 
  | 'created'
  | 'reminder-set'
  | 'cancellation-attempted'
  | 'cancellation-confirmed'
  | 'proof-added'
  | 'charge-disputed'
  | 'support-contacted'
  | 'status-changed'
  | 'note-added';

export interface ProofDocument {
  id: string;
  name: string;
  type: 'screenshot' | 'email' | 'pdf' | 'confirmation-number' | 'other';
  timestamp: string;
  dataUrl?: string; // For storing file data in base64
  notes?: string;
  confirmationNumber?: string; // For reference numbers
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  description: string;
  notes?: string;
  proofId?: string; // Link to proof document if applicable
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  renewalDate: string;
  billingPeriod: BillingPeriod;
  category?: SubscriptionCategory;
  
  // Intent - drives defaults and reminder behavior (NEW)
  intent: SubscriptionIntent;
  
  // Cancel-by logic (ENHANCED - the key differentiator)
  cancelByRule: CancelByRule; // How the cancel-by date is determined
  cancelByDate: string; // The computed deadline to cancel by
  cancelByDaysBefore?: number; // For rules like '3-days-before', stores the number
  cancelByNotes?: string; // e.g., "Must cancel 24 hours before renewal via web only"
  
  // Cancellation details
  cancellationMethod: CancellationMethod;
  cancellationUrl?: string;
  cancellationSteps?: string;
  requiredInfo?: string;
  supportContact?: string; // Phone/email for support
  
  // Reminders
  reminders: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
    dayOf: boolean;
  };
  
  // Proof documents (ENHANCED)
  proofDocuments: ProofDocument[];
  proofStatus: 'not-required' | 'missing' | 'incomplete' | 'complete'; // ENHANCED - conditional on state
  
  // Cancellation timeline (NEW - the case file)
  timeline: TimelineEvent[];
  
  // Status (ENHANCED - added cancel-attempted)
  status: 'active' | 'cancelled' | 'trial' | 'cancel-attempted';
  trialEndDate?: string;
  cancellationDate?: string; // When user confirmed it was cancelled
  cancelAttemptDate?: string; // When user tried but wasn't sure it worked (NEW)
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface AppData {
  subscriptions: Subscription[];
  version: string;
}