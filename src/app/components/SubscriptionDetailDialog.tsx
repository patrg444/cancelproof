import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Subscription, ProofDocument, TimelineEvent } from '@/types/subscription';
import { CancellationTimeline } from '@/app/components/CancellationTimeline';
import { ProofList } from '@/app/components/ProofList';
import { ProofUploader } from '@/app/components/ProofUploader';
import { ProofStatusBadge } from '@/app/components/ProofStatusBadge';
import { 
  Calendar, 
  ExternalLink, 
  Plus,
  Clock,
  AlertCircle,
  Download,
  FileText
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { exportSubscriptionProofBinder } from '@/utils/pdfExport';
import { getProofStatus, getCancelByRuleLabel, getIntentLabel } from '@/utils/subscriptionHelpers';

interface SubscriptionDetailDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSubscription: (subscription: Subscription) => void;
}

export function SubscriptionDetailDialog({
  subscription,
  open,
  onOpenChange,
  onUpdateSubscription,
}: SubscriptionDetailDialogProps) {
  const [isAddingProof, setIsAddingProof] = useState(false);

  if (!subscription) return null;

  const handleAddProof = (proofData: Omit<ProofDocument, 'id' | 'timestamp'>) => {
    const newProof: ProofDocument = {
      ...proofData,
      id: `proof-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      type: 'proof-added',
      timestamp: new Date().toISOString(),
      description: `Added proof: ${newProof.name}`,
      proofId: newProof.id,
    };

    const updatedProofs = [...subscription.proofDocuments, newProof];
    const newProofStatus = getProofStatus(subscription.status, updatedProofs);

    const updatedSubscription: Subscription = {
      ...subscription,
      proofDocuments: updatedProofs,
      timeline: [...subscription.timeline, newEvent],
      proofStatus: newProofStatus,
      updatedAt: new Date().toISOString(),
    };

    onUpdateSubscription(updatedSubscription);
    setIsAddingProof(false);
  };

  const handleDeleteProof = (proofId: string) => {
    const updatedProofs = subscription.proofDocuments.filter(p => p.id !== proofId);
    const newProofStatus = getProofStatus(subscription.status, updatedProofs);
    
    const updatedSubscription: Subscription = {
      ...subscription,
      proofDocuments: updatedProofs,
      proofStatus: newProofStatus,
      updatedAt: new Date().toISOString(),
    };

    onUpdateSubscription(updatedSubscription);
  };

  const daysUntilCancelBy = differenceInDays(new Date(subscription.cancelByDate), new Date());
  const daysUntilRenewal = differenceInDays(new Date(subscription.renewalDate), new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{subscription.name}</DialogTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant={
                  subscription.status === 'cancelled' ? 'secondary' : 
                  subscription.status === 'cancel-attempted' ? 'destructive' :
                  subscription.status === 'trial' ? 'default' :
                  'outline'
                }>
                  {subscription.status === 'cancel-attempted' ? 'Cancel Attempted' : subscription.status}
                </Badge>
                {subscription.proofStatus !== 'not-required' && (
                  <ProofStatusBadge 
                    status={subscription.proofStatus} 
                    count={subscription.proofDocuments.length}
                  />
                )}
                <Badge variant="outline">{getIntentLabel(subscription.intent)}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {subscription.currency}{subscription.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">per {subscription.billingPeriod}</div>
            </div>
          </div>
        </DialogHeader>

        {/* Key Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <AlertCircle className="h-4 w-4" />
              Cancel-By Deadline
            </div>
            <div className="font-semibold">{format(new Date(subscription.cancelByDate), 'MMM d, yyyy')}</div>
            <div className="text-xs text-gray-500 mt-1">
              {daysUntilCancelBy > 0 
                ? `${daysUntilCancelBy} days remaining`
                : daysUntilCancelBy === 0
                ? 'Today!'
                : 'Date passed'}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Rule: {getCancelByRuleLabel(subscription.cancelByRule)}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="h-4 w-4" />
              Next Renewal
            </div>
            <div className="font-semibold">{format(new Date(subscription.renewalDate), 'MMM d, yyyy')}</div>
            <div className="text-xs text-gray-500 mt-1">
              {daysUntilRenewal > 0 
                ? `in ${daysUntilRenewal} days`
                : daysUntilRenewal === 0
                ? 'Today'
                : 'Overdue'}
            </div>
          </div>
        </div>

        {/* Actions */}
        {(subscription.status === 'active' || subscription.status === 'trial') && (
          <div className="flex gap-2 pb-4 border-b">
            {subscription.cancellationUrl && (
              <Button
                variant="default"
                onClick={() => window.open(subscription.cancellationUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Cancellation Page
              </Button>
            )}
            {subscription.cancellationSteps && (
              <Button 
                variant="outline"
                onClick={() => {
                  // Scroll to details tab
                  const detailsTab = document.querySelector('[value="details"]') as HTMLElement;
                  detailsTab?.click();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Steps
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => exportSubscriptionProofBinder(subscription)}
              className="ml-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF Binder
            </Button>
          </div>
        )}

        {/* Actions for cancelled/cancel-attempted subscriptions */}
        {(subscription.status === 'cancelled' || subscription.status === 'cancel-attempted') && (
          <div className="flex gap-2 pb-4 border-b">
            <Button 
              variant="default" 
              onClick={() => exportSubscriptionProofBinder(subscription)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF Binder
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="proof">
              Proof ({subscription.proofDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <CancellationTimeline events={subscription.timeline} />
          </TabsContent>

          <TabsContent value="proof" className="mt-6">
            {isAddingProof ? (
              <ProofUploader
                onAddProof={handleAddProof}
                onCancel={() => setIsAddingProof(false)}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Proof Documents</h3>
                  <Button onClick={() => setIsAddingProof(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Proof
                  </Button>
                </div>
                <ProofList 
                  proofs={subscription.proofDocuments} 
                  onDeleteProof={handleDeleteProof}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="space-y-4">
              {/* Cancel-by Rule */}
              <div>
                <label className="text-sm font-medium text-gray-700">Cancel-By Rule</label>
                <p className="text-sm text-gray-600 mt-1">
                  {getCancelByRuleLabel(subscription.cancelByRule)}
                  {subscription.cancelByRule !== 'anytime' && (
                    <span className="text-gray-500"> → Deadline: {format(new Date(subscription.cancelByDate), 'MMM d, yyyy')}</span>
                  )}
                </p>
              </div>

              {subscription.cancellationUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Cancellation URL</label>
                  <a 
                    href={subscription.cancellationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:underline mt-1"
                  >
                    {subscription.cancellationUrl}
                  </a>
                </div>
              )}

              {subscription.cancellationSteps && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Cancellation Steps</label>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    {subscription.cancellationSteps}
                  </p>
                </div>
              )}

              {subscription.cancelByNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Deadline Notes</label>
                  <p className="text-sm text-gray-600 mt-1">{subscription.cancelByNotes}</p>
                </div>
              )}

              {subscription.supportContact && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Support Contact</label>
                  <p className="text-sm text-gray-600 mt-1">{subscription.supportContact}</p>
                </div>
              )}

              {subscription.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-600 mt-1">{subscription.notes}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}