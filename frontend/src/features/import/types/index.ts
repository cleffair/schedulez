export interface AITaskImport {
  title: string;
  description?: string;
  date?: string; // Mapped to task_date on backend
  start_time?: string;
  end_time?: string;
  priority?: string;
  category?: string;
}

export interface AIScheduleImport {
  version: string;
  title: string;
  description?: string;
  tasks: AITaskImport[];
}

export interface ImportWarning {
  task_title?: string;
  issue: string;
  type: "overlap" | "duplicate" | "invalid_time" | string;
}

export interface PreviewResponse {
  version: string;
  schedule: AIScheduleImport;
  warnings: ImportWarning[];
  total_tasks: number;
}

export interface ScheduleResponse {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
