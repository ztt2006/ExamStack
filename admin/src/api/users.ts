import { apiClient } from '@/api/client'
import type {
  ApiResponse,
  ProfileSummary,
  ResourceListPayload,
  UpdateProfilePayload,
  User,
} from '@/types'

export async function getMyProfile() {
  const response = await apiClient.get<ApiResponse<ProfileSummary>>('/users/me/profile')
  return response.data.data
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.put<ApiResponse<User>>('/users/me/profile', payload)
  return response.data.data
}

export async function uploadMyAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiResponse<User>>('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}

export async function getMyResources(filters: { keyword?: string; page?: number; page_size?: number }) {
  const response = await apiClient.get<ApiResponse<ResourceListPayload>>('/users/me/resources', {
    params: filters,
  })
  return response.data.data
}
