import { apiClient } from '@/api/client'
import type {
  ApiResponse,
  Resource,
  ResourceFilters,
  ResourceListPayload,
  UpdateResourcePayload,
  UploadResourcePayload,
} from '@/types'

export async function getResources(filters: ResourceFilters = {}) {
  const response = await apiClient.get<ApiResponse<ResourceListPayload>>('/resources', {
    params: filters,
  })
  return response.data.data
}

export async function getResourceDetail(resourceId: number) {
  const response = await apiClient.get<ApiResponse<Resource>>(`/resources/${resourceId}`)
  return response.data.data
}

export async function uploadResource(payload: UploadResourcePayload) {
  const formData = new FormData()
  formData.append('description', payload.description)
  formData.append('file', payload.file)

  const response = await apiClient.post<ApiResponse<Resource>>('/resources', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}

export async function updateMyResource(resourceId: number, payload: UpdateResourcePayload) {
  const formData = new FormData()
  formData.append('description', payload.description)
  if (payload.file) {
    formData.append('file', payload.file)
  }

  const response = await apiClient.put<ApiResponse<Resource>>(
    `/users/me/resources/${resourceId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data.data
}

export async function deleteMyResource(resourceId: number) {
  const response = await apiClient.delete<ApiResponse<{ id: number }>>(
    `/users/me/resources/${resourceId}`,
  )
  return response.data.data
}
