import { useRef, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Share2, Download, Copy, Check, X as XIcon, Crown, Pencil } from 'lucide-react';
import { SavingsBreakdown, formatCurrency } from '@/utils/subscriptionUtils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';
import { UpgradePrompt } from '@/app/components/UpgradePrompt';
import { UPGRADE_PROMPTS } from '@/utils/freemiumGates';
import { Textarea } from '@/app/components/ui/textarea';

interface ShareCardProps {
  savings: SavingsBreakdown;
  totalActive: number;
}

export function ShareCard({ savings, totalActive }: ShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [customText, setCustomText] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const { isPremium } = useAuth();

  const yearlySaved = savings.totalYearlySaved;
  const monthlySaved = savings.totalMonthlySaved;
  const cancelledCount = savings.cancelledCount;

  // Don't show if nothing to share
  if (cancelledCount === 0) return null;

  const shareText = `I cancelled ${cancelledCount} subscription${cancelledCount !== 1 ? 's' : ''} and I'm saving ${formatCurrency(yearlySaved, savings.currency)}/year with CancelMem. Stop paying for stuff you don't use.`;

  // Get the text to share (supports custom text for Pro users)
  const getShareText = () => {
    if (isPremium && customText.trim()) return customText;
    return shareText;
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `cancelmem-savings-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
      toast.success('Image downloaded!');
    } catch {
      toast.error('Failed to generate image');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText() + '\n\nhttps://cancelmem.com');
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        // Try to share with image first
        if (cardRef.current) {
          const canvas = await html2canvas(cardRef.current, {
            backgroundColor: null,
            scale: 2,
          });
          const blob = await new Promise<Blob>((resolve) =>
            canvas.toBlob((b) => resolve(b!), 'image/png')
          );
          const file = new File([blob], 'cancelmem-savings.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              text: getShareText(),
              url: 'https://cancelmem.com',
              files: [file],
            });
            return;
          }
        }

        // Fallback to text-only share
        await navigator.share({
          text: getShareText(),
          url: 'https://cancelmem.com',
        });
      } catch {
        // User cancelled share or error
      }
    }
  };

  const handleShareX = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent('https://cancelmem.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Determine the vibe based on savings amount
  const getVibe = () => {
    if (yearlySaved >= 1000) return { emoji: '🔥', label: 'Subscription Slayer', bg: 'from-red-600 to-orange-500' };
    if (yearlySaved >= 500) return { emoji: '💪', label: 'Budget Boss', bg: 'from-purple-600 to-blue-500' };
    if (yearlySaved >= 100) return { emoji: '🎯', label: 'Smart Saver', bg: 'from-blue-600 to-cyan-500' };
    return { emoji: '✨', label: 'Getting Started', bg: 'from-green-600 to-emerald-500' };
  };

  const vibe = getVibe();

  // Free users get a clean but neutral card style
  const freeGradient = 'from-gray-700 to-gray-900';
  const cardGradient = isPremium ? vibe.bg : freeGradient;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <Share2 className="h-4 w-4" />
        Share Your Savings
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Your Savings</DialogTitle>
            <DialogDescription>
              Download or share your cancellation victory
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto min-h-0">
            {/* The shareable card */}
            <div className="relative">
              <div
                ref={cardRef}
                className={`relative rounded-2xl bg-gradient-to-br ${cardGradient} p-6 text-white overflow-hidden`}
              >
                {/* Background pattern - premium only */}
                {isPremium && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white" />
                  </div>
                )}

                <div className="relative z-10">
                  {/* Header - vibe label is Pro only */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{isPremium ? vibe.emoji : '📊'}</span>
                    <span className="text-sm font-medium uppercase tracking-wider opacity-90">
                      {isPremium ? vibe.label : 'My Savings'}
                    </span>
                    {!isPremium && (
                      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/20 text-white/80">
                        <Crown className="h-2.5 w-2.5" /> PRO for custom styles
                      </span>
                    )}
                  </div>

                  {/* Main savings amount */}
                  <div className="mb-1">
                    <div className="text-5xl font-black tracking-tight">
                      {formatCurrency(yearlySaved, savings.currency)}
                    </div>
                    <div className="text-lg opacity-90 font-medium">saved per year</div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-6 mt-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold">{cancelledCount}</div>
                      <div className="text-xs opacity-75 uppercase tracking-wide">
                        {cancelledCount === 1 ? 'sub cancelled' : 'subs cancelled'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(monthlySaved, savings.currency)}</div>
                      <div className="text-xs opacity-75 uppercase tracking-wide">saved/month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{totalActive}</div>
                      <div className="text-xs opacity-75 uppercase tracking-wide">still active</div>
                    </div>
                  </div>

                  {/* Top cancelled subs - shown for all users */}
                  {savings.cancelledSubscriptions.length > 0 && (
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="text-xs opacity-75 uppercase tracking-wide mb-2">Cancelled</div>
                      <div className="flex flex-wrap gap-2">
                        {savings.cancelledSubscriptions.slice(0, 5).map((sub, i) => (
                          <span key={i} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Branding */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[10px]">✓</span>
                      </div>
                      <span className="text-sm font-semibold">CancelMem</span>
                    </div>
                    <span className="text-xs opacity-75">cancelmem.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom text editor - Pro only */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share text</span>
                {isPremium ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!isEditingText) {
                        setCustomText(shareText);
                      }
                      setIsEditingText(!isEditingText);
                    }}
                    className="h-7 gap-1 text-xs"
                  >
                    <Pencil className="h-3 w-3" />
                    {isEditingText ? 'Preview' : 'Customize'}
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-400">
                    <Crown className="h-3 w-3" /> Custom text with Pro
                  </span>
                )}
              </div>
              {isEditingText && isPremium ? (
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                  className="text-sm"
                  placeholder="Write your own share text..."
                />
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                  {getShareText()}
                </p>
              )}
            </div>

            {/* Share actions - all free! (viral) */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownloadImage} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Save Image
              </Button>
              <Button onClick={handleCopyText} variant="outline" className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button onClick={handleShareX} variant="outline" className="gap-2">
                <XIcon className="h-4 w-4" />
                Share on X
              </Button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button onClick={handleShareNative} variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share...
                </Button>
              )}
            </div>

            {/* Upgrade prompt for free users */}
            {!isPremium && (
              <UpgradePrompt
                {...UPGRADE_PROMPTS.shareCard}
                onUpgrade={() => { setIsOpen(false); toast.info('Open Settings to upgrade to Pro'); }}
                variant="inline"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
