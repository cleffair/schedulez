import { useState } from "react";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { DragDropZone } from "../components/DragDropZone";
import { PreviewCard } from "../components/PreviewCard";
import { WarningAlert } from "../components/WarningAlert";
import { SuccessState } from "../components/SuccessState";
import { useValidateImport, usePreviewImport, useExecuteImport } from "../hooks";
import { PreviewResponse, ScheduleResponse } from "../types";

type ImportState = "IDLE" | "VALIDATING" | "PREVIEW" | "EXECUTING" | "SUCCESS";

export function ImportPage() {
  const [currentState, setCurrentState] = useState<ImportState>("IDLE");
  const [rawPayload, setRawPayload] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [successData, setSuccessData] = useState<ScheduleResponse | null>(null);

  const validateMutation = useValidateImport();
  const previewMutation = usePreviewImport();
  const executeMutation = useExecuteImport();

  const handleFileLoaded = async (payload: any) => {
    setCurrentState("VALIDATING");
    setErrorMsg(null);
    setRawPayload(payload);

    try {
      await validateMutation.mutateAsync(payload);
      // If validation succeeds, immediately transition to preview
      const preview = await previewMutation.mutateAsync(payload);
      setPreviewData(preview);
      setCurrentState("PREVIEW");
    } catch (err: any) {
      setCurrentState("IDLE");
      const message = err.response?.data?.detail 
        ? JSON.stringify(err.response.data.detail) 
        : "Failed to validate import payload. Please check the schema.";
      setErrorMsg(message);
    }
  };

  const handleExecute = async () => {
    if (!rawPayload) return;
    
    setCurrentState("EXECUTING");
    setErrorMsg(null);

    try {
      const result = await executeMutation.mutateAsync(rawPayload);
      setSuccessData(result);
      setCurrentState("SUCCESS");
    } catch (err: any) {
      setCurrentState("PREVIEW");
      setErrorMsg(err.response?.data?.detail || "Failed to execute import.");
    }
  };

  const resetState = () => {
    setCurrentState("IDLE");
    setRawPayload(null);
    setErrorMsg(null);
    setPreviewData(null);
    setSuccessData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Schedule Import</h1>
          <p className="text-muted-foreground mt-1">
            Instantly build out full project schedules using AI generated JSON.
          </p>
        </div>
        {currentState !== "IDLE" && currentState !== "SUCCESS" && (
          <button 
            onClick={resetState}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Start Over
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {currentState === "IDLE" && (
        <div className="mt-8">
          <DragDropZone onFileLoaded={handleFileLoaded} onError={setErrorMsg} />
        </div>
      )}

      {(currentState === "VALIDATING" || currentState === "EXECUTING") && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium animate-pulse">
            {currentState === "VALIDATING" ? "Analyzing structure..." : "Building schedule..."}
          </p>
        </div>
      )}

      {currentState === "PREVIEW" && previewData && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {previewData.warnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Detection Warnings ({previewData.warnings.length})
              </h3>
              <div className="grid gap-3">
                {previewData.warnings.map((w, i) => (
                  <WarningAlert key={i} warning={w} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Schedule Preview</h3>
            <PreviewCard schedule={previewData.schedule} totalTasks={previewData.total_tasks} />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handleExecute}
              className="px-8 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Confirm & Import Schedule
            </button>
          </div>
        </div>
      )}

      {currentState === "SUCCESS" && successData && (
        <SuccessState 
          scheduleId={successData.id} 
          title={successData.title} 
          onReset={resetState} 
        />
      )}
    </div>
  );
}
