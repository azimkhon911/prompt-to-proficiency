import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Prompt } from '@/types/ielts';
import Navbar from '@/components/Navbar';
import TaskSelector from '@/components/TaskSelector';
import PromptCard from '@/components/PromptCard';
import { BookOpen, TrendingUp, Target } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const [task, setTask] = useState(2);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState({ avg: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('prompts').select('*').eq('task', task).then(({ data }) => {
      setPrompts((data as Prompt[]) || []);
      setLoading(false);
    });
  }, [task]);

  useEffect(() => {
    if (!user) return;
    supabase.from('attempts').select('overall_score').eq('user_id', user.id).then(({ data }) => {
      if (data && data.length > 0) {
        const scores = data.filter(d => d.overall_score != null).map(d => d.overall_score!);
        setStats({
          avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          total: data.length,
        });
      }
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-primary px-4 py-16 text-primary-foreground">
        <div className="container mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl">IELTS Writing Practice</h1>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Practice with real exam-style prompts and get AI-powered feedback
          </p>
          {user && stats.total > 0 && (
            <div className="mt-8 flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                <span className="font-serif text-2xl">{stats.avg.toFixed(1)}</span>
                <span className="text-sm text-primary-foreground/60">avg band</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span className="font-serif text-2xl">{stats.total}</span>
                <span className="text-sm text-primary-foreground/60">attempts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <TaskSelector activeTask={task} onSelect={setTask} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map(p => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        )}

        {!user && (
          <div className="mt-10 rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-primary/40" />
            <p className="text-muted-foreground">Sign in to save your results and track progress</p>
          </div>
        )}
      </div>
    </div>
  );
}
