import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Prompt } from '@/types/ielts';
import Navbar from '@/components/Navbar';
import Timer from '@/components/Timer';
import WordCounter from '@/components/WordCounter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import PlaceholderChart from '@/components/PlaceholderChart';

export default function Test() {
  const { promptId } = useParams<{ promptId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [essay, setEssay] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const elapsedRef = useRef(0);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const duration = prompt?.task === 1 ? 20 : 40;

  useEffect(() => {
    if (!promptId) return;
    supabase.from('prompts').select('*').eq('id', promptId).single().then(({ data }) => {
      if (data) setPrompt(data as Prompt);
    });
  }, [promptId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (essay.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [essay]);

  const handleSubmit = useCallback(async () => {
    if (!prompt || !user || submitting) return;
    if (wordCount < 20) {
      toast({ title: 'Too short', description: 'Write at least 20 words.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    try {
      const resp = await supabase.functions.invoke('grade-essay', {
        body: {
          promptId: prompt.id,
          essay,
          timeTaken: elapsedRef.current,
          taskType: prompt.task === 1 ? 'Task 1' : 'Task 2',
          minWords: prompt.min_words,
          promptText: prompt.text,
        },
      });

      if (resp.error) throw new Error(resp.error.message);
      const result = resp.data;

      const { data: attempt, error: insertErr } = await supabase.from('attempts').insert({
        user_id: user.id,
        prompt_id: prompt.id,
        essay,
        word_count: wordCount,
        time_taken: elapsedRef.current,
        task_score: result.scores.task_achievement,
        coherence_score: result.scores.coherence_cohesion,
        lexical_score: result.scores.lexical_resource,
        grammar_score: result.scores.grammatical_range,
        overall_score: result.scores.overall,
        feedback: result.feedback,
      }).select().single();

      if (insertErr) throw insertErr;
      navigate(`/results/${attempt.id}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setSubmitting(false);
    }
  }, [prompt, user, essay, wordCount, submitting, navigate, toast]);

  if (!prompt) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Prompt */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Task {prompt.task} — {prompt.type.replace('_', ' ')}
          </div>
          <p className="leading-relaxed text-foreground">{prompt.text}</p>
          {prompt.task === 1 && prompt.type === 'academic' && (
            <PlaceholderChart promptText={prompt.text} />
          )}
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <Timer
            durationMinutes={duration}
            onTimeUp={handleSubmit}
            onTick={(elapsed) => { elapsedRef.current = elapsed; }}
          />
          <WordCounter count={wordCount} target={prompt.min_words} />
        </div>

        {/* Editor */}
        <Textarea
          value={essay}
          onChange={e => setEssay(e.target.value)}
          placeholder="Start writing your essay here..."
          className="min-h-[400px] resize-y text-base leading-relaxed"
          disabled={submitting}
        />

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={wordCount < 20 || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Grading...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Essay
              </>
            )}
          </Button>
        </div>

        {!user && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            You need to sign in to submit and save your results.
          </p>
        )}
      </div>
    </div>
  );
}
