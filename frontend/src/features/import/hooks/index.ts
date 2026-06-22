import { useMutation } from "@tanstack/react-query";
import { validateImport, previewImport, executeImport } from "../api";
import { PreviewResponse, ScheduleResponse } from "../types";

export const useValidateImport = () => {
  return useMutation<{ status: string; message: string }, Error, any>({
    mutationFn: (payload) => validateImport(payload),
  });
};

export const usePreviewImport = () => {
  return useMutation<PreviewResponse, Error, any>({
    mutationFn: (payload) => previewImport(payload),
  });
};

export const useExecuteImport = () => {
  return useMutation<ScheduleResponse, Error, any>({
    mutationFn: (payload) => executeImport(payload),
  });
};
