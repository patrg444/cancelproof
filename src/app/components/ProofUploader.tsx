import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Upload, FileText, Hash, AlertCircle } from 'lucide-react';
import { ProofDocument } from '@/types/subscription';
import { toast } from 'sonner';

interface ProofUploaderProps {
  onAddProof: (proof: Omit<ProofDocument, 'id' | 'timestamp'>) => void;
  onCancel?: () => void;
}

export function ProofUploader({ onAddProof, onCancel }: ProofUploaderProps) {
  const [proofType, setProofType] = useState<ProofDocument['type']>('screenshot');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFile(null);
        toast.error('File is too large. Please choose a file under 10MB.');
        return;
      }
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (proofType === 'confirmation-number') {
      if (!confirmationNumber) return;
      
      onAddProof({
        name: name || `Confirmation ${confirmationNumber}`,
        type: proofType,
        notes,
        confirmationNumber,
      });
      
      resetForm();
    } else {
      if (!file) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddProof({
          name: name || file.name,
          type: proofType,
          notes,
          dataUrl: reader.result as string,
        });
        
        resetForm();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setNotes('');
    setConfirmationNumber('');
    setFile(null);
    setProofType('screenshot');
  };

  const isValid = proofType === 'confirmation-number' 
    ? confirmationNumber.length > 0 
    : file !== null;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="proof-type">Proof Type</Label>
        <Select value={proofType} onValueChange={(value: any) => setProofType(value)}>
          <SelectTrigger id="proof-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="screenshot">Screenshot</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="confirmation-number">Confirmation Number</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {proofType === 'confirmation-number' ? (
        <div>
          <Label htmlFor="confirmation-number">Confirmation Number</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmation-number"
              placeholder="e.g., CNF-12345-ABCD"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="proof-file">Upload File *</Label>
          <div className="mt-1">
            <label
              htmlFor="proof-file"
              className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer focus:outline-none ${
                !file ? 'border-gray-300 hover:border-gray-400' : 'border-blue-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-gray-600" />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Click to upload</span>
                    <span className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</span>
                  </>
                )}
              </div>
              <input
                id="proof-file"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="proof-name">Name (optional)</Label>
        <Input
          id="proof-name"
          placeholder="e.g., Cancellation confirmation screenshot"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="proof-notes">Notes (optional)</Label>
        <Textarea
          id="proof-notes"
          placeholder="Add any additional context..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!isValid}>
          Add Proof
        </Button>
      </div>
    </div>
  );
}
