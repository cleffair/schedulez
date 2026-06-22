import { TaskResponse } from "../types";
import { Clock, Calendar, CheckCircle } from "lucide-react";

interface TaskListWidgetProps {
  title: string;
  tasks: TaskResponse[];
  emptyMessage: string;
  showDate?: boolean;
}

export function TaskListWidget({ title, tasks, emptyMessage, showDate = false }: TaskListWidgetProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col h-full">
      <div className="p-6 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">
          {tasks.length}
        </span>
      </div>
      
      <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors flex items-start justify-between group">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full border h-4 w-4 shrink-0 group-hover:border-primary transition-colors cursor-pointer" />
                  <div>
                    <p className="text-sm font-medium leading-none mb-1.5">{task.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {showDate && task.task_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.task_date}
                        </span>
                      )}
                      {task.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.start_time.slice(0, 5)}
                          {task.end_time && ` - ${task.end_time.slice(0, 5)}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {task.category && (
                  <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0 ml-2">
                    {task.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
