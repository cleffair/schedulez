export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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

export interface ScheduleResponse {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalSchedules: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  todaysTasks: TaskResponse[];
  upcomingTasks: TaskResponse[];
  recentSchedules: ScheduleResponse[];
}
