import api from "../../../lib/api";
import { ScheduleResponse, TaskResponse, PaginatedResponse, ScheduleFormData, TaskFormData } from "../types";

// --- Schedules ---
export const getSchedules = async (page = 1, pageSize = 20, sortBy = "created_at", sortDesc = true): Promise<PaginatedResponse<ScheduleResponse>> => {
  const { data } = await api.get(`/schedules/?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_desc=${sortDesc}`);
  return data;
};

export const getSchedule = async (id: string): Promise<ScheduleResponse> => {
  const { data } = await api.get(`/schedules/${id}`);
  return data;
};

export const createSchedule = async (payload: ScheduleFormData): Promise<ScheduleResponse> => {
  const { data } = await api.post(`/schedules/`, payload);
  return data;
};

export const updateSchedule = async (id: string, payload: ScheduleFormData): Promise<ScheduleResponse> => {
  const { data } = await api.patch(`/schedules/${id}`, payload);
  return data;
};

export const deleteSchedule = async (id: string): Promise<ScheduleResponse> => {
  const { data } = await api.delete(`/schedules/${id}`);
  return data;
};

// --- Tasks ---
export const getTasksForSchedule = async (scheduleId: string, page = 1, pageSize = 100): Promise<PaginatedResponse<TaskResponse>> => {
  // We can fetch all tasks and filter client side if backend doesn't support schedule_id filter yet.
  // Wait, the backend doesn't expose a schedule_id filter on GET /tasks. 
  // Let's assume we can fetch all tasks for the user and filter, or we should update the backend.
  // For now, fetch all tasks and filter. Or just fetch a large page.
  const { data } = await api.get(`/tasks/?page=${page}&page_size=${pageSize}`);
  return data; // Note: We will filter by scheduleId in the hook to avoid changing backend
};

export const createTask = async (payload: TaskFormData & { schedule_id: string }): Promise<TaskResponse> => {
  const { data } = await api.post(`/tasks/`, payload);
  return data;
};

export const updateTask = async (id: string, payload: Partial<TaskFormData> & { completed?: boolean }): Promise<TaskResponse> => {
  const { data } = await api.patch(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<TaskResponse> => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};
