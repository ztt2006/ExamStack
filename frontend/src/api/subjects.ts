import { apiClient } from "@/api/client";
import type { ApiResponse, Subject } from "@/types";

export interface CreateSubjectPayload {
  name: string;
  code: string;
  category: string;
  description?: string;
}

export async function getSubjects() {
  const response = await apiClient.get<ApiResponse<Subject[]>>("/subjects");
  return response.data.data;
}

export async function createSubject(payload: CreateSubjectPayload) {
  const response = await apiClient.post<ApiResponse<Subject>>("/subjects", payload);
  return response.data.data;
}
