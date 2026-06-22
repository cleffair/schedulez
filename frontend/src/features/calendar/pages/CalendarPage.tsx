import { useState } from "react";
import { useCalendarTasks } from "../hooks";
import { CalendarWidget } from "../components/CalendarWidget";
import { EventDetailsModal } from "../components/EventDetailsModal";
import { TaskResponse } from "../types";
import { TaskFormDialog } from "../../schedules/components/TaskFormDialog";
import { useUpdateTask } from "../../schedules/hooks";
import { Loader2, AlertCircle } from "lucide-react";

export function CalendarPage() {
  const { data: events, isLoading, isError } = useCalendarTasks();
  
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const updateTaskMutation = useUpdateTask();

  const handleEventClick = (task: TaskResponse) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleEditClick = () => {
    // Closes details modal and opens edit modal
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (selectedTask) {
      await updateTaskMutation.mutateAsync({ id: selectedTask.id, payload: data });
      setIsEditOpen(false);
      setSelectedTask(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading calendar...</p>
      </div>
    );
  }

  if (isError || !events) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">Failed to load calendar data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Visualize and manage your schedule across all projects.</p>
      </div>

      <div className="flex-1 min-h-[500px]">
        <CalendarWidget 
          events={events} 
          onEventClick={handleEventClick} 
        />
      </div>

      <EventDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          if (!isEditOpen) setSelectedTask(null);
        }}
        task={selectedTask}
        onEditClick={handleEditClick}
      />

      <TaskFormDialog 
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditSubmit}
        initialData={selectedTask as any}
        isSubmitting={updateTaskMutation.isPending}
      />
    </div>
  );
}
