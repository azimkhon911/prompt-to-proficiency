import { cn } from '@/lib/utils';

interface TaskSelectorProps {
  activeTask: number;
  onSelect: (task: number) => void;
}

export default function TaskSelector({ activeTask, onSelect }: TaskSelectorProps) {
  return (
    <div className="flex gap-2">
      {[1, 2].map(task => (
        <button
          key={task}
          onClick={() => onSelect(task)}
          className={cn(
            "rounded-lg px-6 py-3 font-semibold transition-all",
            activeTask === task
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Task {task}
        </button>
      ))}
    </div>
  );
}
