import { Subscription } from '@/types/subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Package,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  calculateTotalMonthlySpend, 
  formatCurrency,
  getUpcomingRenewals,
  getTrialsEndingSoon,
  calculateMonthlyEquivalent
} from '@/utils/subscriptionUtils';

interface StatsOverviewProps {
  subscriptions: Subscription[];
}

export function StatsOverview({ subscriptions }: StatsOverviewProps) {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const trialSubscriptions = subscriptions.filter(s => s.status === 'trial');
  const totalMonthlySpend = calculateTotalMonthlySpend(subscriptions);
  const upcomingRenewals = getUpcomingRenewals(subscriptions, 7);
  const trialsEnding = getTrialsEndingSoon(subscriptions, 7);
  
  // Calculate yearly projection
  const yearlyProjection = totalMonthlySpend * 12;
  
  // Calculate upcoming charges in next 7 days
  const upcomingCharges = upcomingRenewals.reduce((sum, sub) => sum + sub.amount, 0);
  
  const stats = [
    {
      title: 'Monthly Spend',
      value: formatCurrency(totalMonthlySpend, 'USD'),
      description: `${formatCurrency(yearlyProjection, 'USD')} yearly`,
      icon: DollarSign,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions.length.toString(),
      description: `${trialSubscriptions.length} trial${trialSubscriptions.length !== 1 ? 's' : ''}`,
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/40',
    },
    {
      title: 'Renewing in 7 Days',
      value: upcomingRenewals.length.toString(),
      description: formatCurrency(upcomingCharges, 'USD'),
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/40',
    },
    {
      title: 'Trials Ending Soon',
      value: trialsEnding.length.toString(),
      description: trialsEnding.length === 0 ? 'All clear' : 'Action needed',
      icon: AlertTriangle,
      color: trialsEnding.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
      bgColor: trialsEnding.length > 0 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-green-100 dark:bg-green-900/40',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
