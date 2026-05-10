import { apiClient } from '@/api/client'
import type { ApiResponse, CreateSubjectPayload, Subject } from '@/types'

export async function getSubjects() {
  const response = await apiClient.get<ApiResponse<Subject[]>>('/subjects')
  return response.data.data
}

export async function createSubject(payload: CreateSubjectPayload) {
  const response = await apiClient.post<ApiResponse<Subject>>('/subjects', payload)
  return response.data.data
}
