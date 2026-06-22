import api from "../../../lib/api";
import { PaginatedResponse, ScheduleResponse, TaskResponse } from "../types";

export const getSchedules = async (page = 1, pageSize = 5): Promise<PaginatedResponse<ScheduleResponse>> => {
  const { data } = await api.get(`/schedules/?page=${page}&page_size=${pageSize}`);
  return data;
};

export const getTasks = async (completed?: boolean, date?: string, page = 1, pageSize = 50): Promise<PaginatedResponse<TaskResponse>> => {
  let url = `/tasks/?page=${page}&page_size=${pageSize}`;
  if (completed !== undefined) url += `&completed=${completed}`;
  if (date) url += `&date=${date}`;
  const { data } = await api.get(url);
  return data;
};
