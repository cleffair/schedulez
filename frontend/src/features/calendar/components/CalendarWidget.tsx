import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, EventDropArg } from "@fullcalendar/core";
import { CalendarEventPayload, TaskResponse } from "../types";
import { useRescheduleTask } from "../hooks";

interface CalendarWidgetProps {
  events: CalendarEventPayload[];
  onEventClick: (task: TaskResponse) => void;
}

export function CalendarWidget({ events, onEventClick }: CalendarWidgetProps) {
  const rescheduleMutation = useRescheduleTask();

  const handleEventClick = (arg: EventClickArg) => {
    const task = arg.event.extendedProps.task as TaskResponse;
    onEventClick(task);
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const task = arg.event.extendedProps.task as TaskResponse;
    const newStart = arg.event.start;
    const newEnd = arg.event.end;

    if (!newStart) {
      arg.revert();
      return;
    }

    // Extract local date and time reliably
    // newStart is a JS Date object. FullCalendar parses it based on the calendar's timezone (local by default).
    const year = newStart.getFullYear();
    const month = String(newStart.getMonth() + 1).padStart(2, "0");
    const day = String(newStart.getDate()).padStart(2, "0");
    const task_date = `${year}-${month}-${day}`;

    let start_time = task.start_time;
    let end_time = task.end_time;

    // If it was dropped into a time slot (not all day)
    if (!arg.event.allDay) {
      const hours = String(newStart.getHours()).padStart(2, "0");
      const mins = String(newStart.getMinutes()).padStart(2, "0");
      start_time = `${hours}:${mins}:00`;

      if (newEnd) {
        const eHours = String(newEnd.getHours()).padStart(2, "0");
        const eMins = String(newEnd.getMinutes()).padStart(2, "0");
        end_time = `${eHours}:${eMins}:00`;
      } else {
        // If no end time, we could clear it or keep the original duration
        end_time = undefined;
      }
    }

    try {
      await rescheduleMutation.mutateAsync({
        id: task.id,
        payload: { task_date, start_time, end_time }
      });
    } catch (err) {
      // If mutation fails, revert the calendar UI visually
      arg.revert();
      console.error("Failed to reschedule task:", err);
    }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm p-4 h-full overflow-hidden">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        editable={true} // Enables drag and drop
        droppable={true}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop} // Handle dragging the bottom edge to change duration
        height="100%"
        contentHeight="auto"
        aspectRatio={1.5}
        nowIndicator={true}
        eventClassNames={(arg) => {
          // Add specific classes based on task state
          const task = arg.event.extendedProps.task as TaskResponse;
          return task.completed ? ["opacity-50", "line-through"] : [];
        }}
      />
    </div>
  );
}
