import { apiClient } from "@/api/client";
import type { ApiResponse, ProfileSummary, ResourceListPayload } from "@/types";

export async function getMyProfile() {
  const response = await apiClient.get<ApiResponse<ProfileSummary>>("/users/me/profile");
  return response.data.data;
}

export async function getMyResources(page = 1, pageSize = 10) {
  const response = await apiClient.get<ApiResponse<ResourceListPayload>>(
    "/users/me/resources",
    {
      params: {
        page,
        page_size: pageSize,
      },
    },
  );
  return response.data.data;
}
