import { z } from "zod";

// Zod Schemas for Form Validation
export const scheduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  task_date: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  category: z.string().optional().nullable(),
});

// TypeScript Types
export type ScheduleFormData = z.infer<typeof scheduleSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;

export interface ScheduleResponse {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  task_date?: string;
  start_time?: string;
  end_time?: string;
  priority?: string;
  category?: string;
  schedule_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
