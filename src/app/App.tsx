import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { SubscriptionList } from '@/app/components/SubscriptionList';
import { AddSubscriptionDialog } from '@/app/components/AddSubscriptionDialog';
import { SubscriptionDetailDialog } from '@/app/components/SubscriptionDetailDialog';
import { MarkCancelledDialog } from '@/app/components/MarkCancelledDialog';
import { ActionPanel } from '@/app/components/ActionPanel';
import { AuditView } from '@/app/components/AuditView';
import { Subscription } from '@/types/subscription';
import { toast, Toaster } from 'sonner';
import { sampleSubscriptions } from '@/data/sampleData';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [detailSubscription, setDetailSubscription] = useState<Subscription | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [cancelSubscription, setCancelSubscription] = useState<Subscription | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleLoadSampleData = () => {
    setSubscriptions(sampleSubscriptions);
    toast.success('Sample data loaded! Explore the proof-first features.');
  };

  const handleAddSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: `sub-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSubscriptions([...subscriptions, newSubscription]);
    setIsAddDialogOpen(false);
    toast.success('Subscription added successfully');
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsAddDialogOpen(true);
  };

  const handleUpdateSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedSubscription) {
      const updatedSubscription: Subscription = {
        ...subscription,
        id: selectedSubscription.id,
        createdAt: selectedSubscription.createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      setSubscriptions(subscriptions.map(sub => 
        sub.id === selectedSubscription.id ? updatedSubscription : sub
      ));
      setIsAddDialogOpen(false);
      setSelectedSubscription(null);
      toast.success('Subscription updated successfully');
    }
  };

  const handleUpdateSubscriptionFromDetail = (subscription: Subscription) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscription.id ? subscription : sub
    ));
    setDetailSubscription(subscription);
    toast.success('Subscription updated');
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    toast.success('Subscription deleted');
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

  const handleUpdateFromCancelDialog = (subscription: Subscription) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === subscription.id ? subscription : sub
    ));
    
    if (subscription.status === 'cancelled') {
      toast.success('Cancellation recorded with proof');
    } else if (subscription.status === 'cancel-attempted') {
      toast.warning('Cancel attempt recorded - monitor for confirmation');
    }
  };

  const handleAddProof = (subscription: Subscription) => {
    handleViewDetails(subscription);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CancelProof</h1>
              <p className="mt-1 text-sm text-gray-500">
                Your cancellation proof system. Never lose track of cancel-by dates again.
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Subscription
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            />
          </TabsContent>
          
          <TabsContent value="audit" className="mt-6">
            <AuditView subscriptions={subscriptions} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Dialog */}
      <AddSubscriptionDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={selectedSubscription ? handleUpdateSubscription : handleAddSubscription}
        initialData={selectedSubscription || undefined}
      />

      {/* Subscription Detail Dialog */}
      <SubscriptionDetailDialog
        subscription={detailSubscription}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onUpdateSubscription={handleUpdateSubscriptionFromDetail}
      />

      {/* Mark Cancelled Dialog */}
      <MarkCancelledDialog
        subscription={cancelSubscription}
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onUpdateSubscription={handleUpdateFromCancelDialog}
      />
    </div>
  );
}