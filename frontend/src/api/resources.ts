import { apiClient } from "@/api/client";
import type {
  ApiResponse,
  DownloadAction,
  Resource,
  ResourceFilters,
  ResourceListPayload,
} from "@/types";

export interface UploadResourcePayload {
  title: string;
  description: string;
  subject_id: number;
  term: string;
  resource_type: string;
  tags: string;
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
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("subject_id", String(payload.subject_id));
  formData.append("term", payload.term);
  formData.append("resource_type", payload.resource_type);
  formData.append("tags", payload.tags);
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
