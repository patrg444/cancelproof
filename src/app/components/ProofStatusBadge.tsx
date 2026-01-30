import { Badge } from '@/app/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ProofStatusBadgeProps {
  status: 'not-required' | 'missing' | 'incomplete' | 'complete';
  count?: number;
  className?: string;
}

export function ProofStatusBadge({ status, count, className }: ProofStatusBadgeProps) {
  // Don't render anything for 'not-required' status
  if (status === 'not-required') {
    return null;
  }

  const config = {
    missing: {
      icon: XCircle,
      label: 'No Proof',
      variant: 'destructive' as const,
      color: 'text-red-500',
    },
    incomplete: {
      icon: AlertCircle,
      label: count ? `${count} Proof Item${count !== 1 ? 's' : ''}` : 'Incomplete',
      variant: 'secondary' as const,
      color: 'text-yellow-500',
    },
    complete: {
      icon: CheckCircle2,
      label: count ? `${count} Proof Item${count !== 1 ? 's' : ''}` : 'Proof Complete',
      variant: 'default' as const,
      color: 'text-green-500',
    },
  };

  const { icon: Icon, label, variant, color } = config[status];

  return (
    <Badge variant={variant} className={className}>
      <Icon className={`h-3 w-3 mr-1 ${color}`} />
      {label}
    </Badge>
  );
}