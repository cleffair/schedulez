import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCalendarTasks, updateCalendarTask } from "../api";
import { CalendarEventPayload, TaskResponse } from "../types";

export const useCalendarTasks = () => {
  return useQuery({
    queryKey: ["tasks", "calendar"],
    queryFn: async () => {
      const data = await getCalendarTasks();
      
      // Map TaskResponse to FullCalendar EventInput
      const events: CalendarEventPayload[] = data.items
        .filter(task => task.task_date) // Only tasks with dates can be on calendar
        .map(task => {
          let startStr = task.task_date!;
          let endStr = undefined;
          let allDay = true;

          if (task.start_time) {
            allDay = false;
            startStr = `${task.task_date}T${task.start_time}`;
            if (task.end_time) {
              endStr = `${task.task_date}T${task.end_time}`;
            }
          }

          return {
            id: task.id,
            title: task.title,
            start: startStr,
            end: endStr,
            allDay,
            extendedProps: {
              task
            }
          };
        });

      return events;
    },
  });
};

export const useRescheduleTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskResponse> }) => 
      updateCalendarTask(id, payload),
    onSuccess: () => {
      // Invalidate both calendar tasks and general tasks to keep everything in sync
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};
