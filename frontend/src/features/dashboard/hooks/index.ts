import { useQueries } from "@tanstack/react-query";
import { getSchedules, getTasks } from "../api";
import { DashboardData } from "../types";

export const useDashboardData = () => {
  const today = new Date().toISOString().split("T")[0];
  
  // Use useQueries to fire parallel requests
  const results = useQueries({
    queries: [
      {
        queryKey: ["schedules", "recent"],
        queryFn: () => getSchedules(1, 5),
      },
      {
        queryKey: ["tasks", "all"], // Get all tasks for total counts
        queryFn: () => getTasks(undefined, undefined, 1, 1),
      },
      {
        queryKey: ["tasks", "completed"], // Get completed count
        queryFn: () => getTasks(true, undefined, 1, 1),
      },
      {
        queryKey: ["tasks", "today"],
        queryFn: () => getTasks(false, today, 1, 50),
      },
      {
        queryKey: ["tasks", "uncompleted"], // For upcoming filtering
        queryFn: () => getTasks(false, undefined, 1, 100),
      }
    ]
  });

  const isLoading = results.some(r => r.isLoading);
  const isError = results.some(r => r.isError);

  if (isLoading || isError) {
    return { data: null, isLoading, isError };
  }

  const [schedulesData, allTasksData, completedTasksData, todaysTasksData, uncompletedTasksData] = results;

  // 1. Stats Calculation
  const totalSchedules = schedulesData.data?.total || 0;
  const totalTasks = allTasksData.data?.total || 0;
  const completedTasks = completedTasksData.data?.total || 0;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const stats = {
    totalSchedules,
    totalTasks,
    completedTasks,
    completionPercentage,
  };

  // 2. Today's Tasks
  // The API sorts by created_at by default. We should sort today's tasks by start_time
  const todaysTasks = (todaysTasksData.data?.items || []).sort((a, b) => {
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return a.start_time.localeCompare(b.start_time);
  });

  // 3. Upcoming Tasks (Next 7 days, excluding today)
  const todayDateObj = new Date(today);
  const nextWeekDateObj = new Date(todayDateObj);
  nextWeekDateObj.setDate(todayDateObj.getDate() + 7);

  const upcomingTasks = (uncompletedTasksData.data?.items || []).filter(task => {
    if (!task.task_date) return false;
    const taskDateObj = new Date(task.task_date);
    return taskDateObj > todayDateObj && taskDateObj <= nextWeekDateObj;
  }).sort((a, b) => {
    if (!a.task_date) return 1;
    if (!b.task_date) return -1;
    return a.task_date.localeCompare(b.task_date);
  });

  // 4. Recent Schedules
  const recentSchedules = schedulesData.data?.items || [];

  const data: DashboardData = {
    stats,
    todaysTasks,
    upcomingTasks,
    recentSchedules,
  };

  return { data, isLoading: false, isError: false };
};
