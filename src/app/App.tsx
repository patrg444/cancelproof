import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Target, User, LogOut, Cloud, CloudOff, Bell, Settings, Crown } from 'lucide-react';
import { LoadingState } from '@/app/components/StateViews';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { SubscriptionList } from '@/app/components/SubscriptionList';
import { AddSubscriptionDialog } from '@/app/components/AddSubscriptionDialog';
import { SubscriptionDetailDialog } from '@/app/components/SubscriptionDetailDialog';
import { MarkCancelledDialog } from '@/app/components/MarkCancelledDialog';
import { ActionPanel } from '@/app/components/ActionPanel';
import { AuditView } from '@/app/components/AuditView';
import { LandingPage } from '@/app/components/LandingPage';
import { AuthDialog } from '@/app/components/AuthDialog';
import { SettingsDialog } from '@/app/components/SettingsDialog';
import { Subscription } from '@/types/subscription';
import { toast, Toaster } from 'sonner';
import { sampleSubscriptions } from '@/data/sampleData';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';

const FREE_SUBSCRIPTION_LIMIT = 5;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleReminderCheck,
} from '@/lib/notifications';

export default function App() {
  const { user, loading: authLoading, signOut, isConfigured, isPremium } = useAuth();
  const {
    subscriptions,
    loading: subsLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    syncToCloud,
    isCloudEnabled,
  } = useSubscriptions();

  const canAddSubscription = isPremium || subscriptions.length < FREE_SUBSCRIPTION_LIMIT;
  const subscriptionsRemaining = FREE_SUBSCRIPTION_LIMIT - subscriptions.length;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [detailSubscription, setDetailSubscription] = useState<Subscription | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [cancelSubscription, setCancelSubscription] = useState<Subscription | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  // Check notification permission on load
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  // Schedule reminder checks when subscriptions change
  useEffect(() => {
    if (subscriptions.length > 0 && notificationPermission === 'granted') {
      scheduleReminderCheck(subscriptions);
    }
  }, [subscriptions, notificationPermission]);

  // Sync local data when user logs in
  useEffect(() => {
    if (user && isCloudEnabled) {
      syncToCloud();
    }
  }, [user, isCloudEnabled]);

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll get reminders before cancel-by dates.');
      } else if (permission === 'denied') {
        toast.error('Notifications blocked. Enable them in your browser settings.');
      }
    } catch {
      toast.error('Notifications not supported in this browser');
    }
  };

  const handleLoadSampleData = async () => {
    for (const sub of sampleSubscriptions) {
      await addSubscription(sub);
    }
    toast.success('Sample data loaded! Explore the proof-first features.');
  };

  const handleAddSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!canAddSubscription) {
      toast.error(`Free plan limited to ${FREE_SUBSCRIPTION_LIMIT} subscriptions. Upgrade to Premium for unlimited tracking.`);
      return;
    }
    try {
      await addSubscription(subscription);
      setIsAddDialogOpen(false);
      toast.success('Subscription added successfully');
    } catch {
      toast.error('Failed to add subscription');
    }
  };

  const handleOpenAddDialog = () => {
    if (!canAddSubscription) {
      toast.error(`Free plan limited to ${FREE_SUBSCRIPTION_LIMIT} subscriptions. Upgrade to Premium for unlimited tracking.`);
      return;
    }
    setIsAddDialogOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsAddDialogOpen(true);
  };

  const handleUpdateSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSubscription) {
      try {
        const updatedSubscription: Subscription = {
          ...subscription,
          id: selectedSubscription.id,
          createdAt: selectedSubscription.createdAt,
          updatedAt: new Date().toISOString(),
        };
        await updateSubscription(updatedSubscription);
        setIsAddDialogOpen(false);
        setSelectedSubscription(null);
        toast.success('Subscription updated successfully');
      } catch {
        toast.error('Failed to update subscription');
      }
    }
  };

  const handleUpdateSubscriptionFromDetail = async (subscription: Subscription) => {
    try {
      await updateSubscription(subscription);
      setDetailSubscription(subscription);
      toast.success('Subscription updated');
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await deleteSubscription(id);
      toast.success('Subscription deleted');
    } catch {
      toast.error('Failed to delete subscription');
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleViewDetails = (subscription: Subscription) => {
    setDetailSubscription(subscription);
    setIsDetailDialogOpen(true);
  };

  const handleMarkCancelled = (subscription: Subscription) => {
    setCancelSubscription(subscription);
    setIsCancelDialogOpen(true);
  };

  const handleUpdateFromCancelDialog = async (subscription: Subscription) => {
    try {
      await updateSubscription(subscription);
      if (subscription.status === 'cancelled') {
        toast.success('Cancellation recorded with proof');
      } else if (subscription.status === 'cancel-attempted') {
        toast.warning('Cancel attempt recorded - monitor for confirmation');
      }
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const handleAddProof = (subscription: Subscription) => {
    handleViewDetails(subscription);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingState message="Authenticating..." />
      </div>
    );
  }

  const showLanding = !subsLoading && !user && subscriptions.length === 0;

  if (showLanding) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Toaster position="top-right" />

        <LandingPage
          onGetStarted={() => setIsAddDialogOpen(true)}
          onLoadSampleData={handleLoadSampleData}
          onSignIn={() => setIsAuthDialogOpen(true)}
        />

        <AddSubscriptionDialog
          open={isAddDialogOpen}
          onOpenChange={handleDialogClose}
          onSave={selectedSubscription ? handleUpdateSubscription : handleAddSubscription}
          initialData={selectedSubscription || undefined}
        />

        <AuthDialog
          open={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CancelMem</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {isCloudEnabled ? (
                    <>
                      <Cloud className="h-3 w-3 text-green-500" />
                      <span>Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="h-3 w-3 text-gray-400" />
                      <span>Local only</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification button */}
              {notificationPermission !== 'granted' && (
                <Button variant="outline" size="sm" onClick={handleEnableNotifications}>
                  <Bell className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Enable Reminders</span>
                </Button>
              )}

              {/* Add subscription button */}
              <Button onClick={handleOpenAddDialog} variant={canAddSubscription ? 'default' : 'secondary'}>
                <Plus className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Add Subscription</span>
                {!isPremium && !canAddSubscription && <Crown className="h-3 w-3 ml-1 sm:ml-2 text-yellow-400" />}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user ? (
                    <>
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setIsAuthDialogOpen(true)}>
                        <User className="mr-2 h-4 w-4" />
                        Sign in
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Banner for Free Users Near Limit */}
        {!isPremium && subscriptions.length >= FREE_SUBSCRIPTION_LIMIT && (
          <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
            <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="dark:text-blue-200">
                You've reached the free plan limit of {FREE_SUBSCRIPTION_LIMIT} subscriptions.
                Upgrade for unlimited tracking and export.
              </span>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap self-start sm:self-auto" onClick={() => setIsSettingsDialogOpen(true)}>
                Upgrade to Premium
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription count for free users */}
        {!isPremium && subscriptions.length > 0 && subscriptions.length < FREE_SUBSCRIPTION_LIMIT && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {subscriptionsRemaining} of {FREE_SUBSCRIPTION_LIMIT} free subscriptions remaining
          </p>
        )}

        {subsLoading ? (
          <LoadingState message="Loading subscriptions..." />
        ) : (
          <Tabs defaultValue="actions" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="actions">
                <Target className="h-4 w-4 mr-2" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="mt-6">
              <ActionPanel
                subscriptions={subscriptions}
                onSubscriptionClick={handleViewDetails}
                onMarkCancelled={handleMarkCancelled}
              />
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <SubscriptionList
                subscriptions={subscriptions}
                onEdit={handleEditSubscription}
                onDelete={handleDeleteSubscription}
                onViewDetails={handleViewDetails}
                onMarkCancelled={handleMarkCancelled}
                onAddProof={handleAddProof}
                onLoadSampleData={handleLoadSampleData}
                isLoading={subsLoading}
              />
            </TabsContent>

            <TabsContent value="audit" className="mt-6">
              <AuditView subscriptions={subscriptions} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Dialogs */}
      <AddSubscriptionDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={selectedSubscription ? handleUpdateSubscription : handleAddSubscription}
        initialData={selectedSubscription || undefined}
      />

      <SubscriptionDetailDialog
        subscription={detailSubscription}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onUpdateSubscription={handleUpdateSubscriptionFromDetail}
      />

      <MarkCancelledDialog
        subscription={cancelSubscription}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onUpdateSubscription={handleUpdateFromCancelDialog}
      />

      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
      />

      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />
    </div>
  );
}
