import { ScheduleResponse } from "../types";
import { LayoutTemplate, ArrowRight } from "lucide-react";

interface RecentSchedulesWidgetProps {
  schedules: ScheduleResponse[];
}

export function RecentSchedulesWidget({ schedules }: RecentSchedulesWidgetProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col h-full">
      <div className="p-6 border-b">
        <h3 className="font-semibold text-lg">Recent Schedules</h3>
      </div>
      
      <div className="p-4 flex-1">
        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <LayoutTemplate className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No schedules yet</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {schedules.map(schedule => (
              <div 
                key={schedule.id} 
                className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/10 p-2 rounded-md shrink-0">
                    <LayoutTemplate className="h-4 w-4 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{schedule.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Created {new Date(schedule.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
