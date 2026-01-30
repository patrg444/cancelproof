import { TimelineEvent } from '@/types/subscription';
import { Card } from '@/app/components/ui/card';
import { 
  Plus, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  Phone,
  Edit,
  StickyNote
} from 'lucide-react';
import { format } from 'date-fns';

interface CancellationTimelineProps {
  events: TimelineEvent[];
}

export function CancellationTimeline({ events }: CancellationTimelineProps) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return Plus;
      case 'reminder-set':
        return Bell;
      case 'cancellation-attempted':
        return AlertTriangle;
      case 'cancellation-confirmed':
        return CheckCircle;
      case 'proof-added':
        return FileText;
      case 'charge-disputed':
        return DollarSign;
      case 'support-contacted':
        return Phone;
      case 'status-changed':
        return Edit;
      case 'note-added':
        return StickyNote;
      default:
        return FileText;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return 'bg-blue-100 text-blue-600';
      case 'reminder-set':
        return 'bg-purple-100 text-purple-600';
      case 'cancellation-attempted':
        return 'bg-yellow-100 text-yellow-600';
      case 'cancellation-confirmed':
        return 'bg-green-100 text-green-600';
      case 'proof-added':
        return 'bg-indigo-100 text-indigo-600';
      case 'charge-disputed':
        return 'bg-red-100 text-red-600';
      case 'support-contacted':
        return 'bg-orange-100 text-orange-600';
      case 'status-changed':
        return 'bg-gray-100 text-gray-600';
      case 'note-added':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">No timeline events yet</p>
        <p className="text-xs mt-1">Events will appear as you take actions</p>
      </div>
    );
  }

  // Sort events by timestamp descending (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const Icon = getEventIcon(event.type);
        const colorClass = getEventColor(event.type);
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 -mb-4" />
            )}
            
            <div className="flex gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colorClass} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                {event.notes && (
                  <Card className="mt-2 p-3 bg-gray-50">
                    <p className="text-xs text-gray-700">{event.notes}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
