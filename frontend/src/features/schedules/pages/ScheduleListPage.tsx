import { useState, useMemo } from "react";
import { useSchedules, useAllTasks, useCreateSchedule } from "../hooks";
import { ScheduleCard } from "../components/ScheduleCard";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { ScheduleFormData } from "../types";
import { Loader2, Plus, Search, FilterX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ScheduleListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: schedulesData, isLoading: isSchedulesLoading } = useSchedules(1, 100);
  const { data: tasksData, isLoading: isTasksLoading } = useAllTasks();
  const createMutation = useCreateSchedule();

  const handleCreate = async (data: ScheduleFormData) => {
    const newSchedule = await createMutation.mutateAsync(data);
    setIsCreateOpen(false);
    // As per the plan, immediately route to the detail page to start adding tasks
    navigate(`/schedules/${newSchedule.id}?add_task=true`);
  };

  const filteredSchedules = useMemo(() => {
    if (!schedulesData?.items) return [];
    if (!searchTerm) return schedulesData.items;
    const lower = searchTerm.toLowerCase();
    return schedulesData.items.filter(s => 
      s.title.toLowerCase().includes(lower) || 
      (s.description && s.description.toLowerCase().includes(lower))
    );
  }, [schedulesData, searchTerm]);

  const isLoading = isSchedulesLoading || isTasksLoading;

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground mt-1">Manage your project timelines and task groups.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Schedule
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Clear filters"
          >
            <FilterX className="h-5 w-5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse">Loading schedules...</p>
        </div>
      ) : (
        <>
          {filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-card/50">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No schedules found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {searchTerm 
                  ? "We couldn't find any schedules matching your search. Try adjusting your filters." 
                  : "You haven't created any schedules yet. Create your first one to start organizing tasks."}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Create Schedule
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.map(schedule => (
                <ScheduleCard 
                  key={schedule.id} 
                  schedule={schedule} 
                  tasks={tasksData?.items || []} 
                />
              ))}
            </div>
          )}
        </>
      )}

      <ScheduleFormDialog 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
