import { apiClient } from "@/api/client";
import type { ApiResponse, Subject } from "@/types";

export async function getSubjects() {
  const response = await apiClient.get<ApiResponse<Subject[]>>("/subjects");
  return response.data.data;
}
