import { useState } from 'react';
import { Subscription } from '@/types/subscription';
import { SubscriptionCard } from '@/app/components/SubscriptionCard';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { calculateMonthlyEquivalent } from '@/utils/subscriptionUtils';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/app/components/ui/skeleton';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onMarkCancelled?: (subscription: Subscription) => void;
  onAddProof?: (subscription: Subscription) => void;
  onLoadSampleData?: () => void;
  isLoading?: boolean;
}

type SortOption = 'cancel-by-date' | 'renewal-date' | 'amount-high' | 'amount-low' | 'name' | 'category';
type FilterOption = 'all' | 'active' | 'trial' | 'cancelled' | 'cancel-attempted' | 'cancel-soon' | 'proof-missing';

export function SubscriptionList({
  subscriptions,
  onEdit,
  onDelete,
  onViewDetails,
  onMarkCancelled,
  onAddProof,
  onLoadSampleData,
  isLoading = false
}: SubscriptionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('cancel-by-date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Filter subscriptions
  let filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterBy) {
      case 'all':
        matchesFilter = true;
        break;
      case 'active':
        matchesFilter = sub.status === 'active';
        break;
      case 'trial':
        matchesFilter = sub.status === 'trial';
        break;
      case 'cancelled':
        matchesFilter = sub.status === 'cancelled';
        break;
      case 'cancel-attempted':
        matchesFilter = sub.status === 'cancel-attempted';
        break;
      case 'cancel-soon':
        matchesFilter = sub.intent === 'trial' || sub.intent === 'cancel-soon';
        break;
      case 'proof-missing':
        matchesFilter = sub.proofStatus === 'missing' || sub.proofStatus === 'incomplete';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Sort subscriptions
  filteredSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'cancel-by-date':
        // Sort by cancel-by date, putting 'anytime' at the end
        if (a.cancelByRule === 'anytime' && b.cancelByRule !== 'anytime') return 1;
        if (a.cancelByRule !== 'anytime' && b.cancelByRule === 'anytime') return -1;
        return new Date(a.cancelByDate).getTime() - new Date(b.cancelByDate).getTime();
      case 'renewal-date':
        return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
      case 'amount-high': {
        const monthlyA = calculateMonthlyEquivalent(a.amount, a.billingPeriod);
        const monthlyB = calculateMonthlyEquivalent(b.amount, b.billingPeriod);
        return monthlyB - monthlyA;
      }
      case 'amount-low': {
        const monthlyA2 = calculateMonthlyEquivalent(a.amount, a.billingPeriod);
        const monthlyB2 = calculateMonthlyEquivalent(b.amount, b.billingPeriod);
        return monthlyA2 - monthlyB2;
      }
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return (a.category || 'other').localeCompare(b.category || 'other');
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscriptions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trials</SelectItem>
            <SelectItem value="cancel-soon">Cancel Soon</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="cancel-attempted">Cancel Attempted</SelectItem>
            <SelectItem value="proof-missing">Proof Missing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cancel-by-date">Cancel-By Date</SelectItem>
            <SelectItem value="renewal-date">Renewal Date</SelectItem>
            <SelectItem value="amount-high">Cost: High to Low</SelectItem>
            <SelectItem value="amount-low">Cost: Low to High</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        subscriptions.length === 0 ? (
          // Empty state - no subscriptions at all
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your first subscription to start tracking cancel-by dates and storing proof. CancelMem helps you never miss a cancellation deadline.
              </p>
              <div className="space-y-2 text-xs text-left text-muted-foreground bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Add subscriptions with cancel-by dates</li>
                  <li>Get reminded before deadlines</li>
                  <li>Store proof when you cancel</li>
                  <li>Export your proof binder anytime</li>
                </ol>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={onLoadSampleData}
                >
                  Load Sample Data
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Empty state - no matches for search/filter
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No subscriptions found</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              onMarkCancelled={onMarkCancelled}
              onAddProof={onAddProof}
            />
          ))}
        </div>
      )}
    </div>
  );
}
