import { useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
  compact?: boolean;
  isPremium?: boolean; // If false, show static "X days left" instead of live timer
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // total seconds
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const target = parseISO(targetDate);
  const now = new Date();
  const totalSeconds = differenceInSeconds(target, now);

  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: totalSeconds };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, total: totalSeconds };
}

export function CountdownTimer({ targetDate, className = '', compact = false, isPremium = true }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    // Free users: static display, no live updates
    if (!isPremium) return;

    // Update every second if < 1 hour, every minute if < 1 day, every 10 min otherwise
    const intervalMs = time.total <= 3600 ? 1000 : time.total <= 86400 ? 60000 : 600000;

    const interval = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [targetDate, time.total <= 3600, time.total <= 86400, isPremium]);

  if (time.total <= 0) {
    return (
      <span className={`font-mono font-bold text-red-600 dark:text-red-400 ${className}`}>
        Overdue
      </span>
    );
  }

  // Free users: show static "X days left" text
  if (!isPremium) {
    const urgencyClass = time.days === 0
      ? 'text-red-600 dark:text-red-400'
      : time.days <= 3
        ? 'text-orange-600 dark:text-orange-400'
        : time.days <= 7
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-gray-600 dark:text-gray-400';
    return (
      <span className={`font-medium text-xs ${urgencyClass} ${className}`}>
        {time.days === 0 ? '<1 day' : `${time.days}d left`}
      </span>
    );
  }

  // Urgency-based styling
  const urgencyClass = time.days === 0
    ? 'text-red-600 dark:text-red-400'
    : time.days <= 1
      ? 'text-red-500 dark:text-red-400'
      : time.days <= 3
        ? 'text-orange-600 dark:text-orange-400'
        : time.days <= 7
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-gray-600 dark:text-gray-400';

  // Pulse animation for < 24 hours
  const pulseClass = time.days === 0 ? 'animate-pulse' : '';

  if (compact) {
    if (time.days > 0) {
      return (
        <span className={`font-mono font-bold tabular-nums ${urgencyClass} ${pulseClass} ${className}`}>
          {time.days}d {time.hours}h
        </span>
      );
    }
    return (
      <span className={`font-mono font-bold tabular-nums ${urgencyClass} ${pulseClass} ${className}`}>
        {time.hours}h {time.minutes}m
      </span>
    );
  }

  // Full format
  if (time.days > 7) {
    return (
      <span className={`font-mono font-semibold tabular-nums ${urgencyClass} ${className}`}>
        {time.days}d {time.hours}h
      </span>
    );
  }

  if (time.days > 0) {
    return (
      <div className={`flex items-center gap-1 ${pulseClass} ${className}`}>
        <TimerSegment value={time.days} label="d" urgencyClass={urgencyClass} />
        <span className={urgencyClass}>:</span>
        <TimerSegment value={time.hours} label="h" urgencyClass={urgencyClass} />
        <span className={urgencyClass}>:</span>
        <TimerSegment value={time.minutes} label="m" urgencyClass={urgencyClass} />
      </div>
    );
  }

  // Less than 24 hours - show seconds too
  return (
    <div className={`flex items-center gap-1 ${pulseClass} ${className}`}>
      <TimerSegment value={time.hours} label="h" urgencyClass={urgencyClass} />
      <span className={urgencyClass}>:</span>
      <TimerSegment value={time.minutes} label="m" urgencyClass={urgencyClass} />
      <span className={urgencyClass}>:</span>
      <TimerSegment value={time.seconds} label="s" urgencyClass={urgencyClass} />
    </div>
  );
}

function TimerSegment({ value, label, urgencyClass }: { value: number; label: string; urgencyClass: string }) {
  return (
    <span className={`font-mono font-bold tabular-nums ${urgencyClass}`}>
      {String(value).padStart(2, '0')}{label}
    </span>
  );
}
