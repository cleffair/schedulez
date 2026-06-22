import { Loader2, AlertCircle } from "lucide-react";
import { useDashboardData } from "../hooks";
import { StatCards } from "../components/StatCards";
import { QuickActions } from "../components/QuickActions";
import { TaskListWidget } from "../components/TaskListWidget";
import { RecentSchedulesWidget } from "../components/RecentSchedulesWidget";
import { useAuthStore } from "@/store/useAuthStore";

export function DashboardPage() {
  const { profile } = useAuthStore();
  const { data, isLoading, isError } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">Failed to load dashboard data.</p>
      </div>
    );
  }

  // Extract username from email if profile exists
  const username = profile?.email ? profile.email.split("@")[0] : "there";

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {username}</h1>
        <p className="text-muted-foreground mt-1">Here is your schedule overview for today.</p>
      </div>

      {/* Top Row: Stats & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <StatCards stats={data.stats} />
        </div>
        <div className="xl:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Tasks */}
        <div className="lg:col-span-1">
          <TaskListWidget 
            title="Today's Tasks" 
            tasks={data.todaysTasks} 
            emptyMessage="You have no tasks scheduled for today."
          />
        </div>

        {/* Upcoming Tasks */}
        <div className="lg:col-span-1">
          <TaskListWidget 
            title="Upcoming (Next 7 Days)" 
            tasks={data.upcomingTasks} 
            emptyMessage="No upcoming tasks scheduled."
            showDate={true}
          />
        </div>

        {/* Recent Schedules */}
        <div className="lg:col-span-1">
          <RecentSchedulesWidget schedules={data.recentSchedules} />
        </div>

      </div>
    </div>
  );
}
