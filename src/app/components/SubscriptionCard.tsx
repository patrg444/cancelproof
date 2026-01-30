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
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { 
  formatCurrency, 
  calculateMonthlyEquivalent,
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
  const monthlyEquivalent = calculateMonthlyEquivalent(subscription.amount, subscription.billingPeriod);
  const today = new Date();
  const cancelByDate = parseISO(subscription.cancelByDate);
  const renewalDate = parseISO(subscription.renewalDate);
  const daysUntilCancelBy = differenceInDays(cancelByDate, today);
  const daysUntilRenewal = differenceInDays(renewalDate, today);

  const categoryColors: Record<string, string> = {
    streaming: 'bg-purple-100 text-purple-700',
    software: 'bg-blue-100 text-blue-700',
    fitness: 'bg-green-100 text-green-700',
    productivity: 'bg-indigo-100 text-indigo-700',
    news: 'bg-yellow-100 text-yellow-700',
    gaming: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'trial':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancel-soon':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
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
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-xs">
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
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                onClick={() => onDelete(subscription.id)}
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

          {/* Cancel-by date - show for all active/trial, but style based on intent */}
          {(subscription.status === 'active' || subscription.status === 'trial') && (
            <>
              {subscription.intent !== 'keep' ? (
                <div className={`flex items-center gap-2 text-sm p-2 rounded ${
                  urgency === 'today' || urgency === 'urgent' 
                    ? 'bg-red-50 border border-red-200' 
                    : urgency === 'soon' 
                    ? 'bg-orange-50 border border-orange-200'
                    : urgency === 'upcoming'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50'
                }`}>
                  <AlertCircle className={`h-4 w-4 ${
                    urgency === 'today' || urgency === 'urgent' ? 'text-red-600' :
                    urgency === 'soon' ? 'text-orange-600' :
                    urgency === 'upcoming' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-xs">Cancel by</div>
                    <div className="text-sm">
                      {subscription.cancelByRule === 'anytime' ? 'Anytime' : format(cancelByDate, 'MMM d, yyyy')}
                      {daysUntilCancelBy === 0 && ' (Today!)'}
                      {daysUntilCancelBy === 1 && ' (Tomorrow)'}
                      {daysUntilCancelBy > 1 && daysUntilCancelBy <= 7 && ` (${daysUntilCancelBy}d)`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {getCancelByRuleLabel(subscription.cancelByRule)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
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

          {/* Proof action for cancelled/cancel-attempted subscriptions */}
          {(subscription.status === 'cancelled' || subscription.status === 'cancel-attempted') && 
           (subscription.proofStatus === 'missing' || subscription.proofStatus === 'incomplete') && 
           onAddProof && (
            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => onAddProof(subscription)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Proof
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}