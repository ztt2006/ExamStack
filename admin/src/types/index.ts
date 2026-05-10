export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface Pagination {
  total: number
  page: number
  page_size: number
}

export interface User {
  id: number
  username: string
  email: string
  school: string
  avatar_url?: string | null
  points: number
  created_at?: string | null
}

export interface AdminUser extends User {
  uploaded_count: number
  download_count: number
}

export interface AdminUserListPayload {
  items: AdminUser[]
  pagination: Pagination
}

export interface AdminUserFilters {
  keyword?: string
  page?: number
  page_size?: number
}

export interface AdminUpdateUserPayload {
  username: string
  email: string
  school: string
}

export interface AdminUpdateUserPointsPayload {
  points: number
  reason: string
}

export interface AdminResetUserPasswordPayload {
  password: string
}

export interface AuthToken {
  access_token: string
  token_type?: string
}

export interface Subject {
  id: number
  name: string
  code: string
  category: string
  description?: string | null
}

export interface Resource {
  id: number
  description: string
  original_filename: string
  mime_type: string
  file_size: number
  download_count: number
  uploader_id: number
  uploader_name: string
  preview_url: string
  download_url: string
  created_at?: string | null
}

export interface ResourceListPayload {
  items: Resource[]
  pagination: Pagination
}

export interface ProfileSummary {
  id: number
  username: string
  email: string
  school: string
  avatar_url?: string | null
  points: number
  uploaded_count: number
}

export interface ResourceFilters {
  keyword?: string
  page?: number
  page_size?: number
}

export interface CreateSubjectPayload {
  name: string
  code: string
  category: string
  description?: string
}

export interface UpdateProfilePayload {
  username: string
  email: string
  school: string
}

export interface LoginPayload {
  account: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  school: string
}

export interface UploadResourcePayload {
  description: string
  file: File
}

export interface UpdateResourcePayload {
  description: string
  file?: File | null
}

export interface OperationLog {
  id: string
  module: string
  action: string
  target: string
  operator: string
  status: 'success' | 'warning' | 'error'
  createdAt: string
}

export interface SystemHealth {
  apiBaseUrl: string
  online: boolean
  message: string
  checkedAt: string
}
