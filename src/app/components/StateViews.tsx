import { AlertTriangle, Loader2, Inbox } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin mb-3" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  onAction,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
      <div className="rounded-full bg-gray-100 p-4 mb-4" aria-hidden="true">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action && onAction && (
        <Button onClick={onAction} size="sm">
          {action}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
      <div className="rounded-full bg-red-100 p-4 mb-4" aria-hidden="true">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
