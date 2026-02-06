import { Subscription } from '@/types/subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ProofStatusBadge } from '@/app/components/ProofStatusBadge';
import { 
  AlertCircle, 
  Calendar, 
  FileText, 
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Target,
  Clock
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

interface ActionPanelProps {
  subscriptions: Subscription[];
  onSubscriptionClick: (subscription: Subscription) => void;
  onMarkCancelled: (subscription: Subscription) => void;
}

export function ActionPanel({ subscriptions, onSubscriptionClick, onMarkCancelled }: ActionPanelProps) {
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  // ATTENTION MODEL: Only show items that need user action
  
  // Cancel-by deadlines approaching (only for subscriptions they plan to cancel)
  const cancelByDueSoon = subscriptions.filter(
    sub => (sub.status === 'active' || sub.status === 'trial') && sub.intent !== 'keep'
  ).filter(sub => {
    const cancelByDate = new Date(sub.cancelByDate);
    return cancelByDate <= sevenDaysFromNow && cancelByDate >= today;
  });

  // Trials ending that need a decision (only if not already marked to cancel)
  const trialsNeedingDecision = subscriptions.filter(
    sub => sub.status === 'trial' && sub.trialEndDate && sub.intent === 'trial'
  ).filter(sub => {
    const trialEnd = new Date(sub.trialEndDate!);
    return trialEnd <= sevenDaysFromNow && trialEnd >= today;
  });

  // Charges at risk: Renewals for subscriptions they want to cancel but haven't yet
  const chargesAtRisk = subscriptions.filter(
    sub => (sub.status === 'active' || sub.status === 'trial') && 
           sub.intent === 'cancel-soon'
  ).filter(sub => {
    const renewalDate = new Date(sub.renewalDate);
    return renewalDate <= sevenDaysFromNow && renewalDate >= today;
  });

  // Proof missing (cancelled or cancel-attempted with missing/incomplete proof)
  const proofMissing = subscriptions.filter(
    sub => (sub.status === 'cancelled' || sub.status === 'cancel-attempted') && 
           (sub.proofStatus === 'missing' || sub.proofStatus === 'incomplete')
  );

  const totalActions = cancelByDueSoon.length + trialsNeedingDecision.length + proofMissing.length;

  // Get urgent items (next 3 days)
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  const urgentItems = cancelByDueSoon
    .map(sub => {
      const cancelByDate = new Date(sub.cancelByDate);
      const renewalDate = new Date(sub.renewalDate);
      const daysUntilCancelBy = differenceInDays(cancelByDate, today);
      const daysUntilRenewal = differenceInDays(renewalDate, today);
      
      return {
        subscription: sub,
        daysUntilCancelBy,
        daysUntilRenewal,
        urgency: daysUntilCancelBy,
      };
    })
    .sort((a, b) => a.urgency - b.urgency);

  // Trial decision items
  const trialItems = trialsNeedingDecision
    .map(sub => {
      const trialEnd = new Date(sub.trialEndDate!);
      const daysUntilTrialEnd = differenceInDays(trialEnd, today);
      
      return {
        subscription: sub,
        daysUntilTrialEnd,
        urgency: daysUntilTrialEnd,
      };
    })
    .sort((a, b) => a.urgency - b.urgency);

  return (
    <div className="space-y-6">
      {/* Action Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">Cancel-By Deadlines</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{cancelByDueSoon.length}</p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Next 7 days</p>
              </div>
              <AlertCircle className="h-12 w-12 text-orange-400 dark:text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Trials Ending</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{trialsNeedingDecision.length}</p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Need decision</p>
              </div>
              <Clock className="h-12 w-12 text-purple-400 dark:text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Charges at Risk</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{chargesAtRisk.length}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Not cancelled yet</p>
              </div>
              <Calendar className="h-12 w-12 text-blue-400 dark:text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">Proof Missing</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{proofMissing.length}</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Needs attention</p>
              </div>
              <FileText className="h-12 w-12 text-red-400 dark:text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions List with CTAs */}
      {urgentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Cancel-By Deadlines ({urgentItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentItems.map(({ subscription, daysUntilCancelBy }) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{subscription.name}</h4>
                      <Badge variant={
                        daysUntilCancelBy === 0 ? 'destructive' :
                        daysUntilCancelBy === 1 ? 'destructive' :
                        'default'
                      }>
                        {daysUntilCancelBy === 0 ? 'Today!' : 
                         daysUntilCancelBy === 1 ? 'Tomorrow' :
                         `${daysUntilCancelBy}d left`}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Cancel by: {format(new Date(subscription.cancelByDate), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next charge: {format(new Date(subscription.renewalDate), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {subscription.cancellationUrl && (
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(subscription.cancellationUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkCancelled(subscription);
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Done
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSubscriptionClick(subscription)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trials Needing Decision */}
      {trialItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Trials Ending Soon ({trialItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trialItems.map(({ subscription, daysUntilTrialEnd }) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{subscription.name}</h4>
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                        Trial
                      </Badge>
                      <Badge variant={daysUntilTrialEnd <= 1 ? 'destructive' : 'default'}>
                        {daysUntilTrialEnd === 0 ? 'Ends today!' : 
                         daysUntilTrialEnd === 1 ? 'Ends tomorrow' :
                         `${daysUntilTrialEnd}d left`}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Trial ends: {format(new Date(subscription.trialEndDate!), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        First charge: {format(new Date(subscription.renewalDate), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {subscription.cancellationUrl && (
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(subscription.cancellationUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Cancel Trial
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkCancelled(subscription);
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Done
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSubscriptionClick(subscription)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proof Missing Items */}
      {proofMissing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Proof Required ({proofMissing.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proofMissing.map(subscription => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{subscription.name}</h4>
                      <ProofStatusBadge 
                        status={subscription.proofStatus}
                        count={subscription.proofDocuments.length}
                      />
                      {subscription.status === 'cancel-attempted' && (
                        <Badge variant="destructive">Attempt Unconfirmed</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {subscription.status === 'cancel-attempted' 
                        ? `Attempted on ${format(new Date(subscription.cancelAttemptDate || subscription.updatedAt), 'MMM d, yyyy')}`
                        : `Cancelled on ${format(new Date(subscription.cancellationDate || subscription.updatedAt), 'MMM d, yyyy')}`
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => onSubscriptionClick(subscription)}
                    >
                      Add Proof
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalActions === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No urgent actions needed in the next 7 days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}