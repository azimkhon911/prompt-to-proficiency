import { cn } from '@/lib/utils';

interface WordCounterProps {
  count: number;
  target: number;
}

export default function WordCounter({ count, target }: WordCounterProps) {
  const ratio = count / target;
  const color = ratio >= 1 ? 'text-score-good' : ratio >= 0.7 ? 'text-score-average' : 'text-muted-foreground';

  return (
    <div className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors", color)}>
      <span className="font-mono text-base">{count}</span>
      <span className="text-muted-foreground">/ {target} words</span>
    </div>
  );
}
