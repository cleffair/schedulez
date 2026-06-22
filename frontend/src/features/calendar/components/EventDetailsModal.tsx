import { TaskResponse } from "../types";
import { X, Calendar, Clock, Tag, CheckCircle2, Trash2, Edit2, Loader2 } from "lucide-react";
import { useRescheduleTask } from "../hooks";
import { useDeleteTask, useUpdateTask } from "../../schedules/hooks"; // Reuse from schedules module
import { useState } from "react";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskResponse | null;
  onEditClick: () => void;
}

export function EventDetailsModal({ isOpen, onClose, task, onEditClick }: EventDetailsModalProps) {
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTask(); // For toggling complete
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(task.id);
      setIsDeleting(false);
      onClose();
    }
  };

  const handleToggleComplete = async () => {
    await updateMutation.mutateAsync({ id: task.id, payload: { completed: !task.completed } });
    onClose();
  };

  const isLoading = deleteMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate pr-4">{task.title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="space-y-2">
            {task.task_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{task.task_date}</span>
              </div>
            )}
            {task.start_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{task.start_time.slice(0, 5)} {task.end_time && `- ${task.end_time.slice(0, 5)}`}</span>
              </div>
            )}
            {task.category && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-medium">
                  {task.category}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t flex items-center justify-between">
          <button 
            onClick={handleToggleComplete}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              task.completed ? "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30" : "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onClose();
                onEditClick();
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Edit Task"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
