import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Attempt } from '@/types/ielts';
import Navbar from '@/components/Navbar';
import TaskSelector from '@/components/TaskSelector';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

function getScoreColor(score: number) {
  if (score >= 7) return 'text-score-excellent';
  if (score >= 6) return 'text-score-good';
  if (score >= 5) return 'text-score-average';
  return 'text-score-low';
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(0); // 0 = all
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let query = supabase
      .from('attempts')
      .select('*, prompts(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (task > 0) {
      query = query.eq('prompts.task', task);
    }

    query.then(({ data }) => {
      setAttempts((data as unknown as Attempt[]) || []);
      setLoading(false);
    });
  }, [user, task]);

  const chartData = [...attempts]
    .reverse()
    .map((a, i) => ({
      attempt: i + 1,
      score: a.overall_score || 0,
      date: new Date(a.created_at).toLocaleDateString(),
    }));

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6 font-serif text-3xl">Practice History</h1>

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => setTask(0)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              task === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            All
          </button>
          <TaskSelector activeTask={task} onSelect={setTask} />
        </div>

        {/* Progress Chart */}
        {chartData.length >= 2 && (
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-serif text-xl">Score Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 9]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(222, 65%, 28%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(222, 65%, 28%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : attempts.length === 0 ? (
          <p className="text-center text-muted-foreground">No attempts yet. Start practicing!</p>
        ) : (
          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Words</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map(a => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/results/${a.id}`)}
                  >
                    <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>Task {a.prompts?.task}</TableCell>
                    <TableCell className="capitalize">{a.prompts?.type?.replace('_', ' ')}</TableCell>
                    <TableCell className={cn("text-right font-semibold", getScoreColor(a.overall_score || 0))}>
                      {(a.overall_score || 0).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">{a.word_count}</TableCell>
                    <TableCell className="text-right">{Math.floor(a.time_taken / 60)}m</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
