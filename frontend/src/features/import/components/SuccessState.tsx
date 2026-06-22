import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SuccessStateProps {
  scheduleId: string;
  title: string;
  onReset: () => void;
}

export function SuccessState({ scheduleId, title, onReset }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
      <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Import Successful</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Successfully imported <strong>{title}</strong> and all associated tasks into your account.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onReset}
          className="px-6 py-2 rounded-md border hover:bg-muted font-medium transition-colors"
        >
          Import Another
        </button>
        <Link
          to={`/`}
          className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors inline-flex items-center gap-2"
        >
          View Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
