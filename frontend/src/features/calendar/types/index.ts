import { TaskResponse } from "../../schedules/types";

// Re-export TaskResponse for convenience
export type { TaskResponse };

// Custom type if we need calendar specific event payload mapping
export interface CalendarEventPayload {
  id: string;
  title: string;
  start: string; // ISO string or YYYY-MM-DD
  end?: string;
  allDay?: boolean;
  extendedProps: {
    task: TaskResponse;
  };
}
