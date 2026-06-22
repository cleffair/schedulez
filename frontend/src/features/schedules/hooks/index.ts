import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule, getTasksForSchedule, createTask, updateTask, deleteTask } from "../api";
import { ScheduleFormData, TaskFormData } from "../types";

// --- Queries ---

export const useSchedules = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ["schedules", page, pageSize],
    queryFn: () => getSchedules(page, pageSize),
  });
};

export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: ["schedules", id],
    queryFn: () => getSchedule(id),
    enabled: !!id,
  });
};

export const useScheduleTasks = (scheduleId: string) => {
  return useQuery({
    queryKey: ["tasks", scheduleId],
    queryFn: async () => {
      // Temporary workaround: fetch tasks and filter locally by scheduleId
      const data = await getTasksForSchedule(scheduleId);
      return data.items.filter(task => task.schedule_id === scheduleId);
    },
    enabled: !!scheduleId,
  });
};

export const useAllTasks = () => {
  return useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => getTasksForSchedule("all", 1, 1000), // Fetch up to 1000 tasks
  });
};

// --- Mutations ---

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};

export const useUpdateSchedule = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScheduleFormData) => updateSchedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};

export const useCreateTask = (scheduleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskFormData) => createTask({ ...payload, schedule_id: scheduleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] }); // Re-trigger dashboard stats
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: Partial<TaskFormData> & { completed?: boolean } }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
