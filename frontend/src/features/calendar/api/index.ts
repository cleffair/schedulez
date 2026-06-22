import api from "../../../lib/api";
import { PaginatedResponse } from "../../schedules/types";
import { TaskResponse } from "../types";

export const getCalendarTasks = async (startDate?: string, endDate?: string): Promise<PaginatedResponse<TaskResponse>> => {
  // Ideally, backend supports date range filtering. 
  // If not, we fetch a large subset and filter on client.
  // For now we will fetch the first 1000 tasks assuming reasonable dataset.
  const { data } = await api.get(`/tasks/?page=1&page_size=1000`);
  return data;
};

// We reuse the updateTask endpoint from schedules, but keep a wrapper here for feature isolation if desired.
export const updateCalendarTask = async (id: string, payload: Partial<TaskResponse>): Promise<TaskResponse> => {
  const { data } = await api.patch(`/tasks/${id}`, payload);
  return data;
};
