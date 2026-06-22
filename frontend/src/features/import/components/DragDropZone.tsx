import React, { useCallback, useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropZoneProps {
  onFileLoaded: (payload: any) => void;
  onError: (error: string) => void;
}

export function DragDropZone({ onFileLoaded, onError }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      onError("Please upload a valid JSON file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        onFileLoaded(json);
      } catch (err) {
        onError("Failed to parse JSON file. Ensure it is well-formed.");
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files?.length) {
        processFile(files[0]);
      }
    },
    []
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:bg-accent/50 hover:border-primary/50"
      )}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">JSON file matching Schedulez AI Schema</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".json,application/json"
        onChange={onFileInput}
      />
    </div>
  );
}
