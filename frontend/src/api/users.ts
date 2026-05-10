import { apiClient } from "@/api/client";
import type { ApiResponse, ProfileSummary, ResourceListPayload } from "@/types";

export async function getMyProfile() {
  const response = await apiClient.get<ApiResponse<ProfileSummary>>("/users/me/profile");
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

export async function deleteMyResource(resourceId: number) {
  const response = await apiClient.delete<ApiResponse<{ id: number }>>(
    `/users/me/resources/${resourceId}`,
  );
  return response.data.data;
}
