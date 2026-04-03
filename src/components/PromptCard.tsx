import { Prompt } from '@/types/ielts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeLabels: Record<string, string> = {
  academic: 'Academic',
  general: 'General Training',
  opinion: 'Opinion',
  discussion: 'Discussion',
  problem_solution: 'Problem & Solution',
  advantages_disadvantages: 'Advantages & Disadvantages',
};

const typeColors: Record<string, string> = {
  academic: 'bg-primary/10 text-primary',
  general: 'bg-accent/10 text-accent-foreground',
  opinion: 'bg-secondary/20 text-secondary-foreground',
  discussion: 'bg-primary/10 text-primary',
  problem_solution: 'bg-destructive/10 text-destructive',
  advantages_disadvantages: 'bg-accent/10 text-accent-foreground',
};

export default function PromptCard({ prompt }: { prompt: Prompt }) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={typeColors[prompt.type] || ''}>
            {typeLabels[prompt.type] || prompt.type}
          </Badge>
          <span className="text-xs text-muted-foreground">{prompt.min_words}+ words</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4">{prompt.text}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => navigate(`/test/${prompt.id}`)}>
          <FileText className="mr-2 h-4 w-4" />
          Start Test
          <ArrowRight className="ml-auto h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
