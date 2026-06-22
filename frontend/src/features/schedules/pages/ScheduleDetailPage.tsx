import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSchedule, useScheduleTasks, useUpdateSchedule, useDeleteSchedule, useCreateTask, useUpdateTask } from "../hooks";
import { TaskItem } from "../components/TaskItem";
import { ScheduleFormDialog } from "../components/ScheduleFormDialog";
import { TaskFormDialog } from "../components/TaskFormDialog";
import { ScheduleFormData, TaskFormData, TaskResponse } from "../types";
import { Loader2, ArrowLeft, MoreVertical, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";

export function ScheduleDetailPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: schedule, isLoading: isScheduleLoading, isError } = useSchedule(scheduleId!);
  const { data: tasks, isLoading: isTasksLoading } = useScheduleTasks(scheduleId!);

  const updateScheduleMutation = useUpdateSchedule(scheduleId!);
  const deleteScheduleMutation = useDeleteSchedule();
  
  const createTaskMutation = useCreateTask(scheduleId!);
  const updateTaskMutation = useUpdateTask();

  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  // Auto-open add task dialog if query param is present
  useEffect(() => {
    if (searchParams.get("add_task") === "true") {
      setIsTaskFormOpen(true);
      setSearchParams({}); // Remove param from URL
    }
  }, [searchParams, setSearchParams]);

  if (isError) {
    return (
      <div className="flex flex-col h-64 items-center justify-center">
        <p className="text-destructive font-medium text-lg">Schedule not found or you don't have access.</p>
        <button onClick={() => navigate("/schedules")} className="mt-4 text-primary hover:underline">
          Return to Schedules
        </button>
      </div>
    );
  }

  if (isScheduleLoading || isTasksLoading || !schedule) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      </div>
    );
  }

  const completedCount = tasks?.filter(t => t.completed).length || 0;
  const totalCount = tasks?.length || 0;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleUpdateSchedule = async (data: ScheduleFormData) => {
    await updateScheduleMutation.mutateAsync(data);
    setIsEditScheduleOpen(false);
  };

  const handleDeleteSchedule = async () => {
    if (window.confirm("Are you sure you want to delete this schedule? This action cannot be undone.")) {
      await deleteScheduleMutation.mutateAsync(scheduleId!);
      navigate("/schedules");
    }
  };

  const handleTaskSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, payload: data });
    } else {
      await createTaskMutation.mutateAsync(data);
    }
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const openEditTask = (task: TaskResponse) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/schedules")} className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Schedules
        </button>
      </div>

      {/* Header & Metrics */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{schedule.title}</h1>
            {schedule.description && (
              <p className="text-muted-foreground max-w-2xl">{schedule.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsEditScheduleOpen(true)}
              className="p-2 border rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Edit Schedule"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={handleDeleteSchedule}
              className="p-2 border rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete Schedule"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Ribbon */}
        <div className="bg-muted/30 p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Progress</span>
              <span>{completedCount} of {totalCount} Tasks</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Tasks ({totalCount})</h2>
          <button 
            onClick={() => {
              setEditingTask(null);
              setIsTaskFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        {tasks && tasks.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
            <p className="text-muted-foreground mb-4">No tasks in this schedule yet.</p>
            <button 
              onClick={() => {
                setEditingTask(null);
                setIsTaskFormOpen(true);
              }}
              className="text-primary font-medium hover:underline"
            >
              Add your first task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks?.sort((a,b) => {
              // Sort incomplete first, then by date
              if (a.completed !== b.completed) return a.completed ? 1 : -1;
              return (a.task_date || "").localeCompare(b.task_date || "");
            }).map(task => (
              <TaskItem key={task.id} task={task} onEdit={openEditTask} />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ScheduleFormDialog 
        isOpen={isEditScheduleOpen}
        onClose={() => setIsEditScheduleOpen(false)}
        onSubmit={handleUpdateSchedule}
        initialData={schedule}
        isSubmitting={updateScheduleMutation.isPending}
      />

      <TaskFormDialog
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </div>
  );
}
