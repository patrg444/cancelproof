import { Subscription } from '@/types/subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ProofStatusBadge } from '@/app/components/ProofStatusBadge';
import {
  MoreVertical,
  ExternalLink,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle2,
  FileText,
  Plus,
  MapPin,
  Timer
} from 'lucide-react';
import { CountdownTimer } from '@/app/components/CountdownTimer';
import { RageTemplatesDialog } from '@/app/components/RageTemplatesDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { useState } from 'react';
import {
  formatCurrency,
  calculateMonthlyEquivalent,
  getDifficultyLabel,
  getDifficultyColor,
} from '@/utils/subscriptionUtils';
import { format, parseISO, differenceInDays } from 'date-fns';
import { getCancelByRuleLabel, getIntentLabel } from '@/utils/subscriptionHelpers';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onMarkCancelled?: (subscription: Subscription) => void;
  onAddProof?: (subscription: Subscription) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onViewDetails,
  onMarkCancelled,
  onAddProof
}: SubscriptionCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const monthlyEquivalent = calculateMonthlyEquivalent(subscription.amount, subscription.billingPeriod);
  const today = new Date();
  const cancelByDate = parseISO(subscription.cancelByDate);
  const renewalDate = parseISO(subscription.renewalDate);
  const daysUntilCancelBy = differenceInDays(cancelByDate, today);
  const daysUntilRenewal = differenceInDays(renewalDate, today);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete(subscription.id);
  };

  const categoryColors: Record<string, string> = {
    streaming: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    software: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    fitness: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    productivity: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    news: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    gaming: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    other: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const handleCancellationLink = () => {
    if (subscription.cancellationUrl) {
      if (subscription.cancellationMethod === 'email') {
        window.location.href = subscription.cancellationUrl;
      } else if (subscription.cancellationMethod === 'phone') {
        window.location.href = subscription.cancellationUrl;
      } else {
        window.open(subscription.cancellationUrl, '_blank');
      }
    }
  };

  const getCancelByUrgency = () => {
    if (subscription.cancelByRule === 'anytime') return 'anytime';
    if (daysUntilCancelBy < 0) return 'past';
    if (daysUntilCancelBy === 0) return 'today';
    if (daysUntilCancelBy <= 1) return 'urgent';
    if (daysUntilCancelBy <= 3) return 'soon';
    if (daysUntilCancelBy <= 7) return 'upcoming';
    return 'future';
  };

  const urgency = getCancelByUrgency();

  // Check if cancellation route is ready
  const hasCancellationRoute = !!(
    subscription.cancellationUrl || 
    subscription.cancellationSteps || 
    subscription.supportContact
  );

  // Get intent badge styling
  const getIntentBadgeStyle = () => {
    switch (subscription.intent) {
      case 'keep':
        return 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'trial':
        return 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'cancel-soon':
        return 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 ease-out">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{subscription.name}</CardTitle>
              
              {/* Intent pill */}
              {(subscription.status === 'active' || subscription.status === 'trial') && (
                <Badge variant="outline" className={getIntentBadgeStyle()}>
                  {getIntentLabel(subscription.intent)}
                </Badge>
              )}

              {/* Status badges */}
              {subscription.status === 'cancelled' && (
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  Cancelled
                </Badge>
              )}
              {subscription.status === 'cancel-attempted' && (
                <Badge variant="destructive">
                  Cancel Attempted
                </Badge>
              )}

              {/* Cancellation ready indicator */}
              {hasCancellationRoute && (subscription.status === 'active' || subscription.status === 'trial') && (
                <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Route ready
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {subscription.category && (
                <Badge 
                  variant="secondary" 
                  className={categoryColors[subscription.category] || categoryColors.other}
                >
                  {subscription.category}
                </Badge>
              )}
              {subscription.proofStatus !== 'not-required' && (
                <ProofStatusBadge 
                  status={subscription.proofStatus} 
                  count={subscription.proofDocuments.length}
                />
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={`Options for ${subscription.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(subscription)}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {subscription.cancellationUrl && (subscription.status === 'active' || subscription.status === 'trial') && (
                <DropdownMenuItem onClick={handleCancellationLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Cancellation Page
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(subscription)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Pricing info */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(subscription.amount, subscription.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                per {subscription.billingPeriod === 'one-time' ? 'one-time' : subscription.billingPeriod.replace('ly', '')}
              </div>
            </div>
            {subscription.billingPeriod !== 'monthly' && subscription.billingPeriod !== 'one-time' && (
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(monthlyEquivalent, subscription.currency)}/mo
                </div>
                <div className="text-xs text-muted-foreground">
                  equivalent
                </div>
              </div>
            )}
          </div>

          {/* Cancel-by date with countdown timer */}
          {(subscription.status === 'active' || subscription.status === 'trial') && (
            <>
              {subscription.intent !== 'keep' ? (
                <div className={`text-sm p-2 rounded ${
                  urgency === 'today' || urgency === 'urgent'
                    ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                    : urgency === 'soon'
                    ? 'bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800'
                    : urgency === 'upcoming'
                    ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`h-4 w-4 shrink-0 ${
                      urgency === 'today' || urgency === 'urgent' ? 'text-red-600' :
                      urgency === 'soon' ? 'text-orange-600' :
                      urgency === 'upcoming' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-xs">Cancel by</div>
                      <div className="text-sm">
                        {subscription.cancelByRule === 'anytime' ? 'Anytime' : format(cancelByDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                    {/* Live countdown timer */}
                    {subscription.cancelByRule !== 'anytime' && daysUntilCancelBy >= 0 && daysUntilCancelBy <= 30 && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Timer className={`h-3 w-3 ${
                          urgency === 'today' || urgency === 'urgent' ? 'text-red-500' :
                          urgency === 'soon' ? 'text-orange-500' :
                          urgency === 'upcoming' ? 'text-yellow-500' :
                          'text-gray-500'
                        }`} />
                        <CountdownTimer
                          targetDate={subscription.cancelByDate}
                          compact
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-6">
                    {getCancelByRuleLabel(subscription.cancelByRule)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Cancel by: {subscription.cancelByRule === 'anytime' ? 'Anytime' : format(cancelByDate, 'MMM d, yyyy')} ({getCancelByRuleLabel(subscription.cancelByRule)})</span>
                </div>
              )}
            </>
          )}

          {/* Renewal date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {subscription.status === 'trial' && subscription.trialEndDate
                ? `Trial ends: ${format(parseISO(subscription.trialEndDate), 'MMM d, yyyy')}`
                : subscription.status === 'cancelled'
                ? `Cancelled: ${format(parseISO(subscription.cancellationDate || subscription.updatedAt), 'MMM d, yyyy')}`
                : subscription.status === 'cancel-attempted'
                ? `Attempt: ${format(parseISO(subscription.cancelAttemptDate || subscription.updatedAt), 'MMM d, yyyy')}`
                : `Next charge: ${format(renewalDate, 'MMM d, yyyy')}`
              }
            </span>
          </div>

          {/* Cancellation Difficulty */}
          {subscription.cancellationDifficulty && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">
                {subscription.cancellationDifficulty <= 2 ? '😊' : subscription.cancellationDifficulty === 3 ? '😐' : subscription.cancellationDifficulty === 4 ? '😤' : '🤬'}
              </span>
              <span className={`font-medium ${getDifficultyColor(subscription.cancellationDifficulty)}`}>
                {getDifficultyLabel(subscription.cancellationDifficulty)} to cancel
              </span>
            </div>
          )}

          {/* Cancellation link - now always visible if exists */}
          {subscription.cancellationUrl && (subscription.status === 'active' || subscription.status === 'trial') && (
            <div className="text-sm">
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-blue-600 hover:text-blue-700"
                onClick={handleCancellationLink}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open cancellation page
              </Button>
              <span className="text-xs text-muted-foreground ml-2">
                ({subscription.cancellationMethod.replace('-', ' ')})
              </span>
            </div>
          )}

          {/* Action buttons */}
          {(subscription.status === 'active' || subscription.status === 'trial') && onMarkCancelled && (
            <div className="flex gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => onMarkCancelled(subscription)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Cancelled
              </Button>
            </div>
          )}

          {/* Proof action + Rage Post for cancelled/cancel-attempted subscriptions */}
          {(subscription.status === 'cancelled' || subscription.status === 'cancel-attempted') && (
            <div className="flex gap-2 pt-2 border-t">
              {(subscription.proofStatus === 'missing' || subscription.proofStatus === 'incomplete') &&
               onAddProof && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => onAddProof(subscription)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Proof
                </Button>
              )}
              <RageTemplatesDialog subscription={subscription} />
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{subscription.name}</span>? This action cannot be undone, but all proof documents are preserved in your backups.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}