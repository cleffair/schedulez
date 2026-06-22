import { useState } from "react";
import { TaskResponse } from "../types";
import { useUpdateTask, useDeleteTask } from "../hooks";
import { Calendar, Clock, Edit2, Tag, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleCompletion = () => {
    updateMutation.mutate({ id: task.id, payload: { completed: !task.completed } });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteMutation.mutateAsync(task.id);
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-all group relative overflow-hidden",
      task.completed ? "bg-muted/50 border-muted opacity-60" : "bg-card hover:border-primary/30 shadow-sm",
      isDeleting && "opacity-30 pointer-events-none"
    )}>
      {/* Loading Overlay */}
      {(updateMutation.isPending || isDeleting) && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Custom Checkbox */}
        <button 
          onClick={toggleCompletion}
          className={cn(
            "mt-1 h-5 w-5 shrink-0 rounded border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            task.completed ? "bg-primary border-primary text-primary-foreground" : "border-primary hover:bg-primary/10"
          )}
        >
          {task.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm transition-colors", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pr-4">{task.description}</p>
          )}

          {/* Meta Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.task_date && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                <Calendar className="h-3 w-3" />
                {task.task_date}
              </span>
            )}
            {task.start_time && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                <Clock className="h-3 w-3" />
                {task.start_time.slice(0, 5)} {task.end_time && `- ${task.end_time.slice(0, 5)}`}
              </span>
            )}
            {task.category && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">
                <Tag className="h-3 w-3" />
                {task.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <button 
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Edit Task"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button 
          onClick={handleDelete}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Delete Task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// CheckCircle icon for checkbox
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
