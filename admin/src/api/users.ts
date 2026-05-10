import { apiClient } from '@/api/client'
import type {
  AdminResetUserPasswordPayload,
  AdminUpdateUserPayload,
  AdminUpdateUserPointsPayload,
  AdminUser,
  AdminUserFilters,
  AdminUserListPayload,
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

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  const response = await apiClient.get<ApiResponse<AdminUserListPayload>>('/admin/users', {
    params: filters,
  })
  return response.data.data
}

export async function getAdminUserDetail(userId: number) {
  const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${userId}`)
  return response.data.data
}

export async function updateAdminUser(userId: number, payload: AdminUpdateUserPayload) {
  const response = await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${userId}`, payload)
  return response.data.data
}

export async function updateAdminUserPoints(userId: number, payload: AdminUpdateUserPointsPayload) {
  const response = await apiClient.patch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/points`,
    payload,
  )
  return response.data.data
}

export async function resetAdminUserPassword(userId: number, payload: AdminResetUserPasswordPayload) {
  const response = await apiClient.patch<ApiResponse<AdminUser>>(
    `/admin/users/${userId}/password`,
    payload,
  )
  return response.data.data
}
