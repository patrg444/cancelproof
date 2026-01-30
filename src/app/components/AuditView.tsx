import { Subscription } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, DollarSign, Download, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency, calculateMonthlyEquivalent, getDaysUntilRenewal } from '@/utils/subscriptionUtils';
import { format, parseISO, differenceInDays } from 'date-fns';
import { exportAllSubscriptionsProofBinder } from '@/utils/pdfExport';
import { getDaysUntilCancelBy } from '@/utils/subscriptionHelpers';

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
      .map(row => row.map(cell => `\"${cell}\"`).join(','))
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
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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

      {/* Cancel-By Deadlines Alert */}
      {cancelByDeadlinesSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Cancel-By Deadlines Approaching</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cancelByDeadlinesSoon.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-orange-200 last:border-0">
                  <div>
                    <p className="font-medium text-orange-900">{sub.name}</p>
                    <p className="text-sm text-orange-700">
                      {sub.daysUntil === 0 ? 'Deadline today!' : `${sub.daysUntil} day${sub.daysUntil !== 1 ? 's' : ''} until deadline`}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Proof Missing or Incomplete</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proofIssues.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-red-200 last:border-0">
                  <div>
                    <p className="font-medium text-red-900">{sub.name}</p>
                    <p className="text-sm text-red-700">
                      {sub.status === 'cancel-attempted' ? 'Cancel attempted - needs proof' : 'Cancelled - needs proof'}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
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
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Trials Ending Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trialsEndingSoon.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-blue-200 last:border-0">
                  <div>
                    <p className="font-medium text-blue-900">{sub.name}</p>
                    <p className="text-sm text-blue-700">
                      {sub.daysUntil === 0 ? 'Ends today' : `Ends in ${sub.daysUntil} day${sub.daysUntil !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
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
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Trial
                          </Badge>
                        )}
                        {sub.intent === 'cancel-soon' && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                            Cancel Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(sub.amount, sub.currency)} per {sub.billingPeriod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(monthly, sub.currency)}/mo</p>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gray-50 border">
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