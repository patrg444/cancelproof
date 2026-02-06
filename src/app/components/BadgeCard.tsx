import { useState } from 'react';
import {
  BadgeDefinition,
  EarnedBadge,
  RARITY_COLORS,
  CATEGORY_LABELS,
  getBadgeById,
} from '@/data/badges';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Copy, Share2, Check, X as XIcon, Lock } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: EarnedBadge;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function BadgeCard({ badge, earned, size = 'md', onClick }: BadgeCardProps) {
  const isEarned = !!earned;
  const rarity = RARITY_COLORS[badge.rarity];

  const sizes = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const emojiSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const textSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 group transition-all ${
        isEarned ? 'cursor-pointer' : 'cursor-default'
      }`}
      title={isEarned ? `${badge.name} - Click for details` : `${badge.name} - Not yet earned`}
    >
      <div
        className={`${sizes[size]} rounded-xl border-2 flex items-center justify-center transition-all ${
          isEarned
            ? `${rarity.bg} ${rarity.border} ${rarity.glow} shadow-md group-hover:scale-110 group-hover:shadow-lg`
            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-40'
        }`}
      >
        {isEarned ? (
          <span className={emojiSizes[size]}>{badge.emoji}</span>
        ) : (
          <Lock className="h-4 w-4 text-gray-400 dark:text-gray-600" />
        )}
      </div>
      <span
        className={`${textSizes[size]} font-medium text-center leading-tight max-w-[5rem] ${
          isEarned ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
        }`}
      >
        {badge.name}
      </span>
    </button>
  );
}

// ============================================
// BADGE DETAIL DIALOG
// ============================================
interface BadgeDetailDialogProps {
  badge: BadgeDefinition | null;
  earned?: EarnedBadge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BadgeDetailDialog({ badge, earned, open, onOpenChange }: BadgeDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  if (!badge) return null;

  const isEarned = !!earned;
  const rarity = RARITY_COLORS[badge.rarity];
  const category = CATEGORY_LABELS[badge.category];

  const earnedDate = earned
    ? new Date(earned.earnedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${badge.shareText}\n\nTrack your subscriptions at cancelmem.com`
      );
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareX = () => {
    const text = encodeURIComponent(badge.shareText);
    const url = encodeURIComponent('https://cancelmem.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleDownloadBadge = async () => {
    if (!shareCardRef.current) return;
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `cancelmem-badge-${badge.id}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
      toast.success('Badge image downloaded!');
    } catch {
      toast.error('Failed to generate image');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEarned ? 'Badge Earned!' : 'Badge Locked'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Shareable Badge Card */}
          <div
            ref={shareCardRef}
            className={`rounded-xl p-6 text-center ${
              isEarned
                ? `${rarity.bg} border-2 ${rarity.border}`
                : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="text-5xl mb-3">
              {isEarned ? badge.emoji : '🔒'}
            </div>
            <h3 className={`text-lg font-bold ${isEarned ? rarity.text : 'text-gray-400 dark:text-gray-600'}`}>
              {badge.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {badge.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge
                variant="outline"
                className={`text-[10px] uppercase tracking-wider ${
                  isEarned ? rarity.text : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {badge.rarity}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {category.emoji} {category.label}
              </Badge>
            </div>
            {earnedDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Earned {earnedDate}
              </p>
            )}
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
              cancelmem.com
            </p>
          </div>

          {/* Share Actions (only if earned) */}
          {isEarned && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadBadge} className="gap-1.5 text-xs">
                📸 Save Image
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareX} className="gap-1.5 text-xs">
                <XIcon className="h-3 w-3" />
                Post on X
              </Button>
            </div>
          )}

          {/* How to earn (if locked) */}
          {!isEarned && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">How to earn:</p>
              <p>{badge.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
