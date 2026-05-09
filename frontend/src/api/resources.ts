import { apiClient } from "@/api/client";
import type {
  ApiResponse,
  DownloadAction,
  Resource,
  ResourceFilters,
  ResourceListPayload,
} from "@/types";

export interface UploadResourcePayload {
  description: string;
  file: File;
}

export async function getResources(filters: ResourceFilters) {
  const response = await apiClient.get<ApiResponse<ResourceListPayload>>("/resources", {
    params: filters,
  });
  return response.data.data;
}

export async function getResourceDetail(resourceId: string) {
  const response = await apiClient.get<ApiResponse<Resource>>(`/resources/${resourceId}`);
  return response.data.data;
}

export async function uploadResource(payload: UploadResourcePayload) {
  const formData = new FormData();
  formData.append("description", payload.description);
  formData.append("file", payload.file);

  const response = await apiClient.post<ApiResponse<Resource>>("/resources", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function downloadResource(resourceId: number) {
  const response = await apiClient.post<ApiResponse<DownloadAction>>(
    `/resources/${resourceId}/download`,
  );
  return response.data.data;
}
