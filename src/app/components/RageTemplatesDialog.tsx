import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Flame, Copy, Check, X as XIcon, Share2, Shuffle, Pencil } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { formatCurrency, calculateMonthlyEquivalent, getDifficultyLabel } from '@/utils/subscriptionUtils';
import { RAGE_TEMPLATES, TONE_LABELS, fillTemplate, RageTone } from '@/data/rageTemplates';
import { toast } from 'sonner';
import { Textarea } from '@/app/components/ui/textarea';

interface RageTemplatesDialogProps {
  subscription: Subscription;
}

export function RageTemplatesDialog({ subscription }: RageTemplatesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<RageTone | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const difficulty = subscription.cancellationDifficulty
    ? getDifficultyLabel(subscription.cancellationDifficulty)
    : 'Unknown';

  const yearlySaved = calculateMonthlyEquivalent(subscription.amount, subscription.billingPeriod) * 12;

  const templateData = {
    serviceName: subscription.name,
    difficulty: difficulty,
    savings: formatCurrency(yearlySaved, subscription.currency),
    attempts: subscription.timeline.filter(e => e.type === 'cancellation-attempted').length.toString() || '3',
  };

  const filteredTemplates = selectedTone === 'all'
    ? RAGE_TEMPLATES
    : RAGE_TEMPLATES.filter(t => t.tone === selectedTone);

  const getFilledText = (templateId: string) => {
    const template = RAGE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return '';
    return fillTemplate(template.template, templateData);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const text = getFilledText(templateId);
    setEditedText(text);
    setIsEditing(false);
  };

  const handleRandomize = () => {
    const templates = filteredTemplates;
    const random = templates[Math.floor(Math.random() * templates.length)];
    handleSelectTemplate(random.id);
  };

  const getCurrentText = () => {
    return editedText + '\n\nTracked with CancelMem — cancelmem.com';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentText());
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareX = () => {
    const text = encodeURIComponent(editedText);
    const url = encodeURIComponent('https://cancelmem.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: editedText,
          url: 'https://cancelmem.com',
        });
      } catch {
        // User cancelled
      }
    }
  };

  // Only show for cancelled/cancel-attempted subscriptions
  if (subscription.status !== 'cancelled' && subscription.status !== 'cancel-attempted') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-1.5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
      >
        <Flame className="h-3.5 w-3.5" />
        Rage Post
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Rage Post About {subscription.name}
            </DialogTitle>
            <DialogDescription>
              Pick a template, customize it, and share your cancellation story
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto min-h-0">
            {/* Tone filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTone('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  selectedTone === 'all'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                    : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                All
              </button>
              {(Object.entries(TONE_LABELS) as [RageTone, typeof TONE_LABELS[RageTone]][]).map(([tone, info]) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    selectedTone === tone
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                      : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {info.emoji} {info.label}
                </button>
              ))}
              <button
                onClick={handleRandomize}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Shuffle className="h-3 w-3 inline mr-1" />
                Random
              </button>
            </div>

            {/* Template list */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredTemplates.map(template => {
                const filled = fillTemplate(template.template, templateData);
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700 ring-2 ring-orange-400/50'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0">{template.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-gray-200 leading-snug">{filled}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-medium uppercase tracking-wide ${TONE_LABELS[template.tone].color}`}>
                            {template.tone}
                          </span>
                          <span className="text-[10px] text-gray-400">·</span>
                          <span className="text-[10px] text-gray-400">{template.category}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected template preview / edit */}
            {selectedTemplate && (
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your post</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-7 gap-1 text-xs"
                  >
                    <Pencil className="h-3 w-3" />
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                </div>

                {isEditing ? (
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={4}
                    className="text-sm"
                    placeholder="Customize your rage post..."
                  />
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200">
                    {editedText}
                    <div className="text-xs text-gray-400 mt-2">cancelmem.com</div>
                  </div>
                )}

                {/* Share actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button onClick={handleShareX} variant="outline" size="sm" className="gap-1.5">
                    <XIcon className="h-3.5 w-3.5" />
                    Post on X
                  </Button>
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button onClick={handleShareNative} variant="outline" size="sm" className="gap-1.5 col-span-2">
                      <Share2 className="h-3.5 w-3.5" />
                      Share...
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
