import { AIScheduleImport } from "../types";
import { Calendar, ListTodo, Tag } from "lucide-react";

interface PreviewCardProps {
  schedule: AIScheduleImport;
  totalTasks: number;
}

export function PreviewCard({ schedule, totalTasks }: PreviewCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {schedule.title}
        </h3>
        {schedule.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {schedule.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            <span>{totalTasks} Tasks</span>
          </div>
        </div>
      </div>
      <div className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {schedule.tasks.map((task, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium text-sm">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs text-muted-foreground shrink-0">
                {task.date && (
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded">
                    <Calendar className="h-3 w-3" />
                    <span>{task.date}</span>
                  </div>
                )}
                {task.start_time && task.end_time && (
                  <div className="bg-secondary/50 px-2 py-1 rounded">
                    {task.start_time.slice(0, 5)} - {task.end_time.slice(0, 5)}
                  </div>
                )}
                {task.category && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                    <Tag className="h-3 w-3" />
                    <span>{task.category}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
