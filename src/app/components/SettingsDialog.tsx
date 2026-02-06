import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, Cloud, CreditCard, Download, Trash2, Shield, Loader2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { exportBackup, clearAllData } from '@/utils/storage';
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '@/lib/notifications';
import { PRICING_PLANS, createCheckoutSession, createBillingPortalSession } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, isConfigured } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailReminders, setEmailReminders] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState<{
    status: string;
    plan: string;
    current_period_end?: string;
  } | null>(null);

  useEffect(() => {
    setNotificationsEnabled(getNotificationPermission() === 'granted');
  }, [open]);

  // Fetch user subscription status
  useEffect(() => {
    async function fetchSubscription() {
      if (!user || !supabase) return;

      const { data } = await supabase
        .from('user_subscriptions')
        .select('status, plan, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserSubscription(data);
      }
    }

    if (open && user) {
      fetchSubscription();
    }
  }, [open, user]);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await requestNotificationPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        toast.success('Push notifications enabled');
      } else {
        toast.error('Notifications blocked by browser');
      }
    } else {
      toast.info('To disable notifications, use your browser settings');
    }
  };

  const handleExportData = () => {
    const data = exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cancelmem-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup exported');
  };

  const handleClearData = () => {
    setIsClearDataDialogOpen(true);
  };

  const handleConfirmClearData = () => {
    setIsClearDataDialogOpen(false);
    clearAllData();
    toast.success('All local data has been cleared');
    window.location.reload();
  };

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    if (!supabase) {
      toast.error('Service not available');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Please sign in again');
        return;
      }

      const priceId = billingPeriod === 'monthly'
        ? PRICING_PLANS.pro.stripePriceIdMonthly
        : PRICING_PLANS.pro.stripePriceIdYearly;

      if (!priceId) {
        toast.error('Pricing not configured');
        return;
      }

      const result = await createCheckoutSession(priceId, billingPeriod, session.access_token);

      if ('error' in result) {
        toast.error(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      toast.error('Unable to process upgrade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !supabase) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Please sign in again');
        return;
      }

      const result = await createBillingPortalSession(session.access_token);

      if ('error' in result) {
        toast.error(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      toast.error('Unable to open billing portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data Safety Warning */}
          {!isConfigured && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Your data is stored locally. Regularly export backups to keep your cancellation proof safe.
              </AlertDescription>
            </Alert>
          )}

          {/* Account Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Account
            </h3>
            {user ? (
              <div className="text-sm text-gray-600">
                Signed in as <span className="font-medium">{user.email}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Sign in to sync your subscriptions across devices
              </div>
            )}
          </div>

          <Separator />

          {/* Notifications Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Get reminded before cancel-by deadlines</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={!isNotificationSupported()}
                />
              </div>
              {user && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-reminders">Email Reminders</Label>
                    <p className="text-sm text-gray-500">Receive email reminders as backup</p>
                  </div>
                  <Switch
                    id="email-reminders"
                    checked={emailReminders}
                    onCheckedChange={setEmailReminders}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Cloud Sync Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Sync
            </h3>
            {isConfigured && user ? (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Your data is synced to the cloud
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                {isConfigured
                  ? 'Sign in to enable cloud sync'
                  : 'Cloud sync is not configured'}
              </div>
            )}
          </div>

          <Separator />

          {/* Subscription Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </h3>
            {userSubscription?.status === 'active' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">Pro Plan</span>
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Active
                  </span>
                </div>
                <ul className="text-sm text-green-700 space-y-1 mb-3">
                  {PRICING_PLANS.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {userSubscription.current_period_end && (
                  <p className="text-xs text-green-600 mb-3">
                    Renews on {new Date(userSubscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Free Plan</span>
                  <span className="text-sm text-gray-500">Current</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {PRICING_PLANS.free.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Billing period toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                      billingPeriod === 'monthly'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Monthly
                    <div className="font-semibold">${PRICING_PLANS.pro.priceMonthly}/mo</div>
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                      billingPeriod === 'yearly'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Yearly
                    <div className="font-semibold">${PRICING_PLANS.pro.priceYearly}/yr</div>
                    <div className="text-xs text-green-600">Save 33%</div>
                  </button>
                </div>

                <Button
                  onClick={handleUpgrade}
                  className="w-full"
                  disabled={isLoading || !user}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : !user ? (
                    'Sign in to Upgrade'
                  ) : (
                    `Upgrade to Pro - $${billingPeriod === 'monthly' ? PRICING_PLANS.pro.priceMonthly + '/mo' : PRICING_PLANS.pro.priceYearly + '/yr'}`
                  )}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Data Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Backup (JSON)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleClearData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Local Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <AlertDialog open={isClearDataDialogOpen} onOpenChange={setIsClearDataDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Clear All Data</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete all your subscriptions and data from this device. This action cannot be undone. Please export a backup first if you want to preserve your data.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearData} className="bg-red-600 hover:bg-red-700">
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
