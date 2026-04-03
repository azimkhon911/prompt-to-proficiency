import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Attempt, AttemptFeedback } from '@/types/ielts';
import Navbar from '@/components/Navbar';
import BandScoreCard from '@/components/BandScoreCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RotateCcw, PlusCircle, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

function getScoreColor(score: number) {
  if (score >= 7) return 'text-score-excellent';
  if (score >= 6) return 'text-score-good';
  if (score >= 5) return 'text-score-average';
  return 'text-score-low';
}

export default function Results() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    supabase
      .from('attempts')
      .select('*, prompts(*)')
      .eq('id', attemptId)
      .single()
      .then(({ data }) => {
        if (data) setAttempt(data as unknown as Attempt);
      });
  }, [attemptId]);

  if (!attempt) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  const fb = attempt.feedback as AttemptFeedback | null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        {/* Overall Score */}
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Overall Band Score</p>
          <div className={cn("mt-2 font-serif text-7xl font-bold", getScoreColor(attempt.overall_score || 0))}>
            {(attempt.overall_score || 0).toFixed(1)}
          </div>
          {fb?.band_level && (
            <p className="mt-1 text-lg text-muted-foreground">{fb.band_level}</p>
          )}
          <div className="mt-3 text-sm text-muted-foreground">
            {attempt.word_count} words · {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
          </div>
        </div>

        {/* Criteria Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <BandScoreCard label="Task Achievement" score={attempt.task_score || 0} feedback={fb?.task_feedback} />
          <BandScoreCard label="Coherence & Cohesion" score={attempt.coherence_score || 0} feedback={fb?.coherence_feedback} />
          <BandScoreCard label="Lexical Resource" score={attempt.lexical_score || 0} feedback={fb?.lexical_feedback} />
          <BandScoreCard label="Grammatical Range" score={attempt.grammar_score || 0} feedback={fb?.grammar_feedback} />
        </div>

        {/* Errors & Corrections */}
        {fb?.errors && fb.errors.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-score-average" />
                Errors & Corrections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fb.errors.map((err, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-destructive line-through">{err}</p>
                  {fb.corrections[i] && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-score-good">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {fb.corrections[i]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {fb?.improvement_tips && fb.improvement_tips.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-secondary" />
                Tips for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {fb.improvement_tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="font-semibold text-primary">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate(`/test/${attempt.prompt_id}`)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => navigate('/')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Test
          </Button>
        </div>
      </div>
    </div>
  );
}
