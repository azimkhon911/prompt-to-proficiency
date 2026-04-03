import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  onTick?: (elapsed: number) => void;
}

export default function Timer({ durationMinutes, onTimeUp, isPaused, onTick }: TimerProps) {
  const [remaining, setRemaining] = useState(durationMinutes * 60);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        onTick?.(durationMinutes * 60 - next);
        if (next <= 0) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, durationMinutes, onTick]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isWarning = remaining <= 300;
  const isCritical = remaining <= 120;

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-semibold transition-colors",
      isCritical ? "bg-destructive/10 text-destructive animate-pulse" :
      isWarning ? "bg-secondary/30 text-secondary-foreground" :
      "bg-muted text-foreground"
    )}>
      <Clock className="h-5 w-5" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
