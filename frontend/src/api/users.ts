import { apiClient } from "@/api/client";
import type {
  ApiResponse,
  ProfileSummary,
  Resource,
  ResourceListPayload,
  UpdateProfilePayload,
  UpdateMyResourcePayload,
  User,
} from "@/types";

export async function getMyProfile() {
  const response = await apiClient.get<ApiResponse<ProfileSummary>>("/users/me/profile");
  return response.data.data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.put<ApiResponse<User>>("/users/me/profile", payload);
  return response.data.data;
}

export async function uploadMyAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<User>>("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export interface MyResourcesFilters {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export async function getMyResources(filters: MyResourcesFilters = {}) {
  const { keyword, page = 1, pageSize = 10 } = filters;
  const response = await apiClient.get<ApiResponse<ResourceListPayload>>(
    "/users/me/resources",
    {
      params: {
        keyword,
        page,
        page_size: pageSize,
      },
    },
  );
  return response.data.data;
}

export async function getMyResourceDetail(resourceId: number) {
  const response = await apiClient.get<ApiResponse<Resource>>(`/users/me/resources/${resourceId}`);
  return response.data.data;
}

export async function updateMyResource(resourceId: number, payload: UpdateMyResourcePayload) {
  const formData = new FormData();
  formData.append("description", payload.description);
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const response = await apiClient.put<ApiResponse<Resource>>(
    `/users/me/resources/${resourceId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data.data;
}

export async function deleteMyResource(resourceId: number) {
  const response = await apiClient.delete<ApiResponse<{ id: number }>>(
    `/users/me/resources/${resourceId}`,
  );
  return response.data.data;
}
