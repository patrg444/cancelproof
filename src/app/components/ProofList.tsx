import { ProofDocument } from '@/types/subscription';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { FileText, Image, Mail, Hash, File, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ProofListProps {
  proofs: ProofDocument[];
  onDeleteProof?: (proofId: string) => void;
  onViewProof?: (proof: ProofDocument) => void;
}

export function ProofList({ proofs, onDeleteProof, onViewProof }: ProofListProps) {
  const getIcon = (type: ProofDocument['type']) => {
    switch (type) {
      case 'screenshot':
        return Image;
      case 'email':
        return Mail;
      case 'pdf':
        return FileText;
      case 'confirmation-number':
        return Hash;
      default:
        return File;
    }
  };

  if (proofs.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No proof items yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add screenshots, emails, or confirmation numbers as proof of cancellation</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proofs.map((proof) => {
        const Icon = getIcon(proof.type);
        
        return (
          <Card key={proof.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{proof.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {format(new Date(proof.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    {proof.type !== 'confirmation-number' && proof.dataUrl && onViewProof && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProof(proof)}
                        className="h-8 w-8 p-0"
                        aria-label={`View ${proof.name}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteProof && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteProof(proof.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Delete ${proof.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {proof.confirmationNumber && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                    {proof.confirmationNumber}
                  </div>
                )}
                
                {proof.notes && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{proof.notes}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
