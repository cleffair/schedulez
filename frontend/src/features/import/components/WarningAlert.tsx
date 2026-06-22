import { AlertTriangle, Clock, Copy } from "lucide-react";
import { ImportWarning } from "../types";

export function WarningAlert({ warning }: { warning: ImportWarning }) {
  const Icon = warning.type === "overlap" || warning.type === "invalid_time" ? Clock :
               warning.type === "duplicate" ? Copy : AlertTriangle;

  return (
    <div className="flex items-start gap-3 p-4 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">
          {warning.task_title ? `Task Issue: ${warning.task_title}` : "Schedule Issue"}
        </p>
        <p className="text-sm opacity-90">
          {warning.issue}
        </p>
      </div>
    </div>
  );
}
