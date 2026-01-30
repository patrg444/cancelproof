export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          currency: string;
          renewal_date: string;
          billing_period: string;
          category: string | null;
          intent: string;
          cancel_by_rule: string;
          cancel_by_date: string;
          cancel_by_days_before: number | null;
          cancel_by_notes: string | null;
          cancellation_method: string;
          cancellation_url: string | null;
          cancellation_steps: string | null;
          required_info: string | null;
          support_contact: string | null;
          reminders: Json;
          proof_documents: Json;
          proof_status: string;
          timeline: Json;
          status: string;
          trial_end_date: string | null;
          cancellation_date: string | null;
          cancel_attempt_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          currency?: string;
          renewal_date: string;
          billing_period: string;
          category?: string | null;
          intent: string;
          cancel_by_rule: string;
          cancel_by_date: string;
          cancel_by_days_before?: number | null;
          cancel_by_notes?: string | null;
          cancellation_method: string;
          cancellation_url?: string | null;
          cancellation_steps?: string | null;
          required_info?: string | null;
          support_contact?: string | null;
          reminders?: Json;
          proof_documents?: Json;
          proof_status?: string;
          timeline?: Json;
          status?: string;
          trial_end_date?: string | null;
          cancellation_date?: string | null;
          cancel_attempt_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          currency?: string;
          renewal_date?: string;
          billing_period?: string;
          category?: string | null;
          intent?: string;
          cancel_by_rule?: string;
          cancel_by_date?: string;
          cancel_by_days_before?: number | null;
          cancel_by_notes?: string | null;
          cancellation_method?: string;
          cancellation_url?: string | null;
          cancellation_steps?: string | null;
          required_info?: string | null;
          support_contact?: string | null;
          reminders?: Json;
          proof_documents?: Json;
          proof_status?: string;
          timeline?: Json;
          status?: string;
          trial_end_date?: string | null;
          cancellation_date?: string | null;
          cancel_attempt_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          push_enabled: boolean;
          email_reminders: boolean;
          default_reminder_days: number[];
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          push_enabled?: boolean;
          email_reminders?: boolean;
          default_reminder_days?: number[];
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          push_enabled?: boolean;
          email_reminders?: boolean;
          default_reminder_days?: number[];
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
      };
    };
  };
}
