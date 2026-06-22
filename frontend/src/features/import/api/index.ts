import api from "../../../lib/api";
import { PreviewResponse, ScheduleResponse } from "../types";

export const validateImport = async (payload: any): Promise<{ status: string; message: string }> => {
  const { data } = await api.post("/import/validate", payload);
  return data;
};

export const previewImport = async (payload: any): Promise<PreviewResponse> => {
  const { data } = await api.post<PreviewResponse>("/import/preview", payload);
  return data;
};

export const executeImport = async (payload: any): Promise<ScheduleResponse> => {
  const { data } = await api.post<ScheduleResponse>("/import/execute", payload);
  return data;
};
