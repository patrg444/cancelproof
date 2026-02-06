import { useState } from 'react';
import { CancellationGuide, GuideStep } from '@/data/cancellationGuides';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Clock,
  Shield,
  Copy,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getDifficultyLabel, getDifficultyColor } from '@/utils/subscriptionUtils';

interface CancellationGuideViewerProps {
  guide: CancellationGuide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancellationGuideViewer({ guide, open, onOpenChange }: CancellationGuideViewerProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showDarkPatterns, setShowDarkPatterns] = useState(false);

  const toggleStep = (stepNumber: number) => {
    const next = new Set(completedSteps);
    if (next.has(stepNumber)) {
      next.delete(stepNumber);
    } else {
      next.add(stepNumber);
    }
    setCompletedSteps(next);
  };

  const allComplete = completedSteps.size === guide.steps.length;
  const progress = Math.round((completedSteps.size / guide.steps.length) * 100);

  const handleCopyGuide = () => {
    const text = [
      `How to cancel ${guide.serviceName} (${getDifficultyLabel(guide.difficulty)} - ${guide.estimatedTime})`,
      '',
      ...guide.steps.map(s => `${s.number}. ${s.title}: ${s.description}`),
      '',
      `Guide from cancelmem.com`,
    ].join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleShareGuide = () => {
    const text = `How to cancel ${guide.serviceName}:\n${guide.steps.map(s => `${s.number}. ${s.title}`).join('\n')}\n\nFull guide at cancelmem.com`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-xl">
                How to Cancel {guide.serviceName}
              </DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className={getDifficultyColor(guide.difficulty)}>
                  {guide.difficulty <= 2 ? '😊' : guide.difficulty === 3 ? '😐' : guide.difficulty === 4 ? '😤' : '🤬'}{' '}
                  {getDifficultyLabel(guide.difficulty)}
                </Badge>
                <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {guide.estimatedTime}
                </Badge>
                <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                  {guide.method.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto min-h-0 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{completedSteps.size} of {guide.steps.length} steps</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  allComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Dark Pattern Warnings */}
          {guide.darkPatterns && guide.darkPatterns.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <button
                onClick={() => setShowDarkPatterns(!showDarkPatterns)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">
                    Dark Pattern Warnings ({guide.darkPatterns.length})
                  </span>
                </div>
                {showDarkPatterns ? (
                  <ChevronUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </button>
              {showDarkPatterns && (
                <ul className="mt-2 space-y-1">
                  {guide.darkPatterns.map((pattern, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{pattern}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {guide.steps.map((step) => (
              <StepCard
                key={step.number}
                step={step}
                isComplete={completedSteps.has(step.number)}
                onToggle={() => toggleStep(step.number)}
              />
            ))}
          </div>

          {/* Completion Message */}
          {allComplete && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="font-semibold text-green-800 dark:text-green-300">All steps completed!</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Don't forget to screenshot your confirmation and save proof.
              </p>
            </div>
          )}

          {/* Tips */}
          {guide.tips && guide.tips.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Pro Tips</span>
              </div>
              <ul className="space-y-1">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-1.5">
                    <span className="text-blue-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {guide.cancellationUrl && !guide.cancellationUrl.startsWith('mailto:') && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(guide.cancellationUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Cancellation Page
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleCopyGuide}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Guide
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareGuide}>
              <Share2 className="h-4 w-4 mr-2" />
              Share on X
            </Button>
          </div>

          {/* Support Contact */}
          {guide.supportContact && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
              Support: {guide.supportContact}
              {guide.lastVerified && (
                <span className="ml-2">• Guide verified: {guide.lastVerified}</span>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepCard({
  step,
  isComplete,
  onToggle,
}: {
  step: GuideStep;
  isComplete: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-lg p-3 transition-all cursor-pointer ${
        isComplete
          ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="mt-0.5 shrink-0">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              isComplete
                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {step.number}
            </span>
            <h4 className={`font-medium text-sm ${
              isComplete ? 'text-green-800 dark:text-green-300 line-through' : 'dark:text-white'
            }`}>
              {step.title}
            </h4>
          </div>

          <p className={`text-xs mt-1 ${
            isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {step.description}
          </p>

          {/* Action Chip */}
          {step.action && !isComplete && (
            <div className="mt-2">
              <span className="inline-flex items-center text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full px-2 py-0.5">
                {step.action}
              </span>
            </div>
          )}

          {/* Warning */}
          {step.warning && !isComplete && (
            <div className="flex items-start gap-1.5 mt-2 p-1.5 bg-amber-50 dark:bg-amber-950/50 rounded text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{step.warning}</span>
            </div>
          )}

          {/* Tip */}
          {step.tip && !isComplete && (
            <div className="flex items-start gap-1.5 mt-1.5 text-xs text-blue-600 dark:text-blue-400">
              <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{step.tip}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
