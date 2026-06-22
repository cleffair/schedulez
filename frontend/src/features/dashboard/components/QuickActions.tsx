import { Link } from "react-router-dom";
import { Sparkles, Plus, Calendar as CalendarIcon } from "lucide-react";

export function QuickActions() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        <Link
          to="/import"
          className="flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          <Sparkles className="h-5 w-5 relative z-10" />
          <div className="relative z-10 text-left">
            <p className="font-semibold text-sm">AI Import Schedule</p>
            <p className="text-xs text-primary-foreground/80">Generate from JSON</p>
          </div>
        </Link>
        
        <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left">
          <Plus className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-semibold text-sm">Create Schedule</p>
            <p className="text-xs text-muted-foreground">Start from scratch</p>
          </div>
        </button>

        <button className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-semibold text-sm">View Calendar</p>
            <p className="text-xs text-muted-foreground">See your month</p>
          </div>
        </button>
      </div>
    </div>
  );
}
