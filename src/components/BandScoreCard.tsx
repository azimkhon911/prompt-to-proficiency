import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BandScoreCardProps {
  label: string;
  score: number;
  feedback?: string;
}

function getScoreColor(score: number) {
  if (score >= 7) return 'text-score-excellent';
  if (score >= 6) return 'text-score-good';
  if (score >= 5) return 'text-score-average';
  return 'text-score-low';
}

function getProgressColor(score: number) {
  if (score >= 7) return '[&>div]:bg-score-excellent';
  if (score >= 6) return '[&>div]:bg-score-good';
  if (score >= 5) return '[&>div]:bg-score-average';
  return '[&>div]:bg-score-low';
}

export default function BandScoreCard({ label, score, feedback }: BandScoreCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={cn("font-serif text-2xl font-bold", getScoreColor(score))}>
          {score.toFixed(1)}
        </span>
      </div>
      <Progress value={(score / 9) * 100} className={cn("h-2", getProgressColor(score))} />
      {feedback && (
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">{feedback}</p>
      )}
    </div>
  );
}
