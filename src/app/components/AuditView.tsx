import { Subscription } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, DollarSign, Download, FileText, AlertCircle, PartyPopper } from 'lucide-react';
import { formatCurrency, calculateMonthlyEquivalent, getDaysUntilRenewal, calculateSavings } from '@/utils/subscriptionUtils';
import { format, parseISO, differenceInDays } from 'date-fns';
import { exportAllSubscriptionsProofBinder } from '@/utils/pdfExport';
import { getDaysUntilCancelBy } from '@/utils/subscriptionHelpers';
import { ShareCard } from '@/app/components/ShareCard';

interface AuditViewProps {
  subscriptions: Subscription[];
}

export function AuditView({ subscriptions }: AuditViewProps) {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active' || sub.status === 'trial');
  
  // Sort by monthly equivalent cost
  const sortedByMonthlyEquivalent = [...activeSubscriptions].sort((a, b) => {
    const monthlyA = calculateMonthlyEquivalent(a.amount, a.billingPeriod);
    const monthlyB = calculateMonthlyEquivalent(b.amount, b.billingPeriod);
    return monthlyB - monthlyA;
  });
  
  // Get subscriptions with cancel-by deadlines approaching
  const cancelByDeadlinesSoon = subscriptions
    .filter(sub => (sub.status === 'active' || sub.status === 'trial') && sub.intent !== 'keep')
    .map(sub => ({
      ...sub,
      daysUntil: getDaysUntilCancelBy(sub.cancelByDate)
    }))
    .filter(sub => sub.daysUntil >= 0 && sub.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Get trials ending soon
  const trialsEndingSoon = subscriptions
    .filter(sub => sub.status === 'trial' && sub.trialEndDate)
    .map(sub => ({
      ...sub,
      daysUntil: sub.trialEndDate ? differenceInDays(parseISO(sub.trialEndDate), new Date()) : 999
    }))
    .filter(sub => sub.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  
  // Get proof issues (cancelled or cancel-attempted with missing proof)
  const proofIssues = subscriptions.filter(
    sub => (sub.status === 'cancelled' || sub.status === 'cancel-attempted') &&
           (sub.proofStatus === 'missing' || sub.proofStatus === 'incomplete')
  );

  // Get upcoming renewals (next 30 days)
  const upcomingRenewals = activeSubscriptions
    .map(sub => ({
      ...sub,
      daysUntil: getDaysUntilRenewal(sub)
    }))
    .filter(sub => sub.daysUntil >= 0 && sub.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  
  // Calculate total monthly spending
  const totalMonthlySpending = activeSubscriptions.reduce((acc, sub) => {
    return acc + calculateMonthlyEquivalent(sub.amount, sub.billingPeriod);
  }, 0);
  
  // Group by currency for totals
  const currencyTotals = activeSubscriptions.reduce((acc, sub) => {
    const monthly = calculateMonthlyEquivalent(sub.amount, sub.billingPeriod);
    acc[sub.currency] = (acc[sub.currency] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>);

  // Calculate savings from cancelled subscriptions
  const savings = calculateSavings(subscriptions);

  const handleExportCSV = () => {
    const headers = [
      'Name', 'Amount', 'Currency', 'Billing Period', 'Monthly Equivalent', 
      'Renewal Date', 'Cancel-By Date', 'Intent', 'Status', 'Proof Status',
      'Category', 'Cancellation Method'
    ];
    const rows = sortedByMonthlyEquivalent.map(sub => [
      sub.name,
      sub.amount,
      sub.currency,
      sub.billingPeriod,
      calculateMonthlyEquivalent(sub.amount, sub.billingPeriod),
      format(parseISO(sub.renewalDate), 'yyyy-MM-dd'),
      format(parseISO(sub.cancelByDate), 'yyyy-MM-dd'),
      sub.intent,
      sub.status,
      sub.proofStatus,
      sub.category || '',
      sub.cancellationMethod
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cancelmem-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (subscriptions.length === 0) {
      return;
    }
    try {
      exportAllSubscriptionsProofBinder(subscriptions);
    } catch {
      // PDF export error handled
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Active Subscriptions</CardDescription>
            <CardTitle className="text-3xl">{activeSubscriptions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {subscriptions.filter(s => s.status === 'trial').length} trials,{' '}
              {subscriptions.filter(s => s.status === 'cancelled').length} cancelled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Monthly Spending</CardDescription>
            <div className="space-y-1">
              {Object.entries(currencyTotals).map(([currency, amount]) => (
                <CardTitle key={currency} className="text-2xl">
                  {formatCurrency(amount, currency)}/mo
                </CardTitle>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estimated monthly equivalent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cancel-By Deadlines</CardDescription>
            <CardTitle className="text-3xl">{cancelByDeadlinesSoon.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Proof Issues</CardDescription>
            <CardTitle className="text-3xl">{proofIssues.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Missing or incomplete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Callout */}
      {savings.cancelledCount > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <PartyPopper className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    You&apos;re saving
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-green-700 dark:text-green-300">
                      {formatCurrency(savings.totalYearlySaved, savings.currency)}
                    </span>
                    <span className="text-lg text-green-600 dark:text-green-400 font-medium">/year</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    by cancelling {savings.cancelledCount} subscription{savings.cancelledCount !== 1 ? 's' : ''}
                    {' '}&middot;{' '}
                    {formatCurrency(savings.totalMonthlySaved, savings.currency)}/month
                  </p>
                </div>
              </div>
              <ShareCard savings={savings} totalActive={activeSubscriptions.length} />
            </div>

            {/* Individual cancelled subs breakdown */}
            {savings.cancelledSubscriptions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <div className="flex flex-wrap gap-3">
                  {savings.cancelledSubscriptions.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1.5">
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">{sub.name}</span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {formatCurrency(sub.monthlySaved, sub.currency)}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel-By Deadlines Alert */}
      {cancelByDeadlinesSoon.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-orange-900 dark:text-orange-200">Cancel-By Deadlines Approaching</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cancelByDeadlinesSoon.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-orange-200 dark:border-orange-800 last:border-0">
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-200">{sub.name}</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {sub.daysUntil === 0 ? 'Deadline today!' : `${sub.daysUntil} day${sub.daysUntil !== 1 ? 's' : ''} until deadline`}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                    {format(parseISO(sub.cancelByDate), 'MMM d')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proof Issues Alert */}
      {proofIssues.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-red-900 dark:text-red-200">Proof Missing or Incomplete</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proofIssues.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-red-200 dark:border-red-800 last:border-0">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">{sub.name}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {sub.status === 'cancel-attempted' ? 'Cancel attempted - needs proof' : 'Cancelled - needs proof'}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700">
                    {sub.proofStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Alerts */}
      {trialsEndingSoon.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-900 dark:text-blue-200">Trials Ending Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trialsEndingSoon.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-blue-200 dark:border-blue-800 last:border-0">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200">{sub.name}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {sub.daysUntil === 0 ? 'Ends today' : `Ends in ${sub.daysUntil} day${sub.daysUntil !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                    {sub.trialEndDate && format(parseISO(sub.trialEndDate), 'MMM d')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Subscriptions by Monthly Cost */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscriptions by Monthly Cost</CardTitle>
              <CardDescription>Sorted by monthly equivalent (highest first)</CardDescription>
            </div>
            <div className="space-x-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export Proof Binder (PDF)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedByMonthlyEquivalent.map(sub => {
              const monthly = calculateMonthlyEquivalent(sub.amount, sub.billingPeriod);
              const percentage = (monthly / totalMonthlySpending) * 100;
              
              return (
                <div key={sub.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sub.name}</span>
                        {sub.status === 'trial' && (
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs">
                            Trial
                          </Badge>
                        )}
                        {sub.intent === 'cancel-soon' && (
                          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 text-xs">
                            Cancel Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(sub.amount, sub.currency)} per {sub.billingPeriod === 'one-time' ? 'one-time' : sub.billingPeriod.replace('ly', '')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(monthly, sub.currency)}/mo</p>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Renewals Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals (Next 30 Days)</CardTitle>
          <CardDescription>Renewals you should be aware of</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No renewals in the next 30 days
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingRenewals.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                      <span className="text-2xl font-bold">{format(parseISO(sub.renewalDate), 'd')}</span>
                      <span className="text-xs text-muted-foreground">{format(parseISO(sub.renewalDate), 'MMM')}</span>
                    </div>
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.daysUntil === 0 ? 'Renews today' : `Renews in ${sub.daysUntil} day${sub.daysUntil !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(sub.amount, sub.currency)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{sub.billingPeriod}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
