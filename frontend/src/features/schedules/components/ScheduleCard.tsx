import { Link } from "react-router-dom";
import { ScheduleResponse, TaskResponse } from "../types";
import { Calendar, CheckCircle2, ListTodo } from "lucide-react";

interface ScheduleCardProps {
  schedule: ScheduleResponse;
  tasks: TaskResponse[];
}

export function ScheduleCard({ schedule, tasks }: ScheduleCardProps) {
  const scheduleTasks = tasks.filter(t => t.schedule_id === schedule.id);
  const completedTasks = scheduleTasks.filter(t => t.completed).length;
  const totalTasks = scheduleTasks.length;
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <Link 
      to={`/schedules/${schedule.id}`}
      className="flex flex-col justify-between p-6 rounded-xl border bg-card hover:border-primary/50 hover:bg-accent/50 transition-colors shadow-sm group"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate pr-4 group-hover:text-primary transition-colors">{schedule.title}</h3>
        </div>
        {schedule.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{schedule.description}</p>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ListTodo className="h-3.5 w-3.5" />
              {totalTasks} Tasks
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completedTasks} Done
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(schedule.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
