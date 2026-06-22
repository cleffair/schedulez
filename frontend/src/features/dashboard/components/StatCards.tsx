import { Calendar, CheckCircle2, LayoutTemplate, Percent } from "lucide-react";
import { DashboardStats } from "../types";

export function StatCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total Schedules",
      value: stats.totalSchedules,
      icon: LayoutTemplate,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: Calendar,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionPercentage}%`,
      icon: Percent,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{card.title}</h3>
            <div className={`p-2 rounded-full ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
