import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Subscription, TimelineEvent, ProofDocument, CancellationMethod } from '@/types/subscription';
import { ProofUploader } from '@/app/components/ProofUploader';
import { CheckCircle, HelpCircle, Upload } from 'lucide-react';
import { getProofStatus } from '@/utils/subscriptionHelpers';

interface MarkCancelledDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSubscription: (subscription: Subscription) => void;
}

type CancellationOutcome = 'confirmed' | 'attempted';

export function MarkCancelledDialog({
  subscription,
  open,
  onOpenChange,
  onUpdateSubscription,
}: MarkCancelledDialogProps) {
  const [outcome, setOutcome] = useState<CancellationOutcome>('confirmed');
  const [cancellationDate, setCancellationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [method, setMethod] = useState<CancellationMethod>(
    subscription?.cancellationMethod || 'web'
  );
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isAddingProof, setIsAddingProof] = useState(false);
  const [proofs, setProofs] = useState<Omit<ProofDocument, 'id' | 'timestamp'>[]>([]);

  if (!subscription) return null;

  const handleAddProof = (proofData: Omit<ProofDocument, 'id' | 'timestamp'>) => {
    setProofs([...proofs, proofData]);
    setIsAddingProof(false);
  };

  const handleSubmit = () => {
    const now = new Date().toISOString();
    
    // Create proof documents
    const newProofDocuments: ProofDocument[] = proofs.map((proof, index) => ({
      ...proof,
      id: `proof-${Date.now()}-${index}`,
      timestamp: now,
    }));

    // Add confirmation number as proof if provided
    if (confirmationNumber.trim()) {
      newProofDocuments.push({
        id: `proof-${Date.now()}-conf`,
        name: 'Confirmation Number',
        type: 'confirmation-number',
        timestamp: now,
        confirmationNumber: confirmationNumber.trim(),
      });
    }

    // Create timeline events
    const newEvents: TimelineEvent[] = [];

    if (outcome === 'attempted') {
      newEvents.push({
        id: `event-${Date.now()}-1`,
        type: 'cancellation-attempted',
        timestamp: cancellationDate,
        description: `Cancellation attempted via ${method}`,
        notes: notes || undefined,
      });
    } else {
      newEvents.push({
        id: `event-${Date.now()}-1`,
        type: 'cancellation-confirmed',
        timestamp: cancellationDate,
        description: `Subscription cancelled via ${method}`,
        notes: notes || undefined,
      });
    }

    // Add proof events
    newProofDocuments.forEach((proof, index) => {
      newEvents.push({
        id: `event-${Date.now()}-proof-${index}`,
        type: 'proof-added',
        timestamp: now,
        description: `Added proof: ${proof.name}`,
        proofId: proof.id,
      });
    });

    // Update subscription
    const allProofs = [...subscription.proofDocuments, ...newProofDocuments];
    const newStatus = outcome === 'confirmed' ? 'cancelled' : 'cancel-attempted';
    const newProofStatus = getProofStatus(newStatus, allProofs);

    const updatedSubscription: Subscription = {
      ...subscription,
      status: newStatus,
      cancellationDate: outcome === 'confirmed' ? cancellationDate : undefined,
      cancelAttemptDate: outcome === 'attempted' ? cancellationDate : undefined,
      proofDocuments: allProofs,
      proofStatus: newProofStatus,
      timeline: [...subscription.timeline, ...newEvents],
      updatedAt: now,
    };

    onUpdateSubscription(updatedSubscription);
    onOpenChange(false);
    
    // Reset form
    setOutcome('confirmed');
    setCancellationDate(new Date().toISOString().split('T')[0]);
    setMethod(subscription.cancellationMethod || 'web');
    setConfirmationNumber('');
    setNotes('');
    setProofs([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Cancellation</DialogTitle>
          <DialogDescription>
            Document your cancellation to create a proof record. This is essential for disputes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto min-h-0">
          {/* Outcome Selection */}
          <div className="space-y-3">
            <Label>What happened?</Label>
            <RadioGroup value={outcome} onValueChange={(v) => setOutcome(v as CancellationOutcome)}>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value="confirmed" id="confirmed" />
                <div className="flex-1">
                  <label
                    htmlFor="confirmed"
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    I successfully cancelled
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    You received confirmation that the subscription was cancelled
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value="attempted" id="attempted" />
                <div className="flex-1">
                  <label
                    htmlFor="attempted"
                    className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    I tried but I'm not sure it worked
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    You attempted to cancel but didn't receive clear confirmation
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="cancellation-date">
              {outcome === 'confirmed' ? 'Cancellation Date' : 'Attempt Date'}
            </Label>
            <Input
              id="cancellation-date"
              type="date"
              value={cancellationDate}
              onChange={(e) => setCancellationDate(e.target.value)}
            />
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Cancellation Method</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value as CancellationMethod)}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white px-3 py-2 text-sm"
            >
              <option value="web">Website</option>
              <option value="app-store">App Store</option>
              <option value="google-play">Google Play</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>

          {/* Confirmation Number */}
          {outcome === 'confirmed' && (
            <div className="space-y-2">
              <Label htmlFor="confirmation-number">Confirmation Number (optional)</Label>
              <Input
                id="confirmation-number"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                placeholder="e.g., CANCEL-2025-12345"
              />
            </div>
          )}

          {/* Proof Upload */}
          <div className="space-y-3">
            <Label>Proof Documents</Label>
            {isAddingProof ? (
              <div className="border rounded-lg p-4">
                <ProofUploader
                  onAddProof={handleAddProof}
                  onCancel={() => setIsAddingProof(false)}
                />
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingProof(true)}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {proofs.length > 0 ? `Add Another Proof (${proofs.length} added)` : 'Add Proof (Screenshot, Email, PDF)'}
                </Button>
                {proofs.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {proofs.map((proof, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {proof.name}
                      </div>
                    ))}
                  </div>
                )}
                {proofs.length === 0 && (
                  <p className="text-sm text-amber-600">
                    ⚠️ Consider adding proof now to strengthen your cancellation record
                  </p>
                )}
              </>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about the cancellation..."
              rows={3}
            />
          </div>

        </div>

        {/* Submit Actions - fixed footer */}
        <div className="flex gap-3 pt-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {outcome === 'confirmed' ? 'Mark as Cancelled' : 'Record Attempt'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
