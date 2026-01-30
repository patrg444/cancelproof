import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, Cloud, CreditCard, Download, Trash2, Shield } from 'lucide-react';
import { exportBackup, clearAllData } from '@/utils/storage';
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '@/lib/notifications';
import { PRICING_PLANS } from '@/lib/stripe';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, isConfigured } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailReminders, setEmailReminders] = useState(true);

  useEffect(() => {
    setNotificationsEnabled(getNotificationPermission() === 'granted');
  }, [open]);

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
    a.download = `cancelproof-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup exported');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete all local data? This cannot be undone.')) {
      clearAllData();
      toast.success('All local data cleared');
      window.location.reload();
    }
  };

  const handleUpgrade = () => {
    toast.info('Payment integration coming soon! For now, enjoy all features free.');
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
              <Button onClick={handleUpgrade} className="w-full" variant="outline">
                Upgrade to Pro - ${PRICING_PLANS.pro.priceMonthly}/month
              </Button>
            </div>
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
    </Dialog>
  );
}
