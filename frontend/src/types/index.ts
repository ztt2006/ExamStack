export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Pagination {
  total: number;
  page: number;
  page_size: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  school: string;
  avatar_url?: string | null;
  points: number;
  created_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string | null;
}

export interface Resource {
  id: number;
  description: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  download_count: number;
  uploader_id: number;
  uploader_name: string;
  uploader_avatar_url?: string | null;
  preview_url: string;
  download_url: string;
  created_at?: string;
}

export interface ResourceListPayload {
  items: Resource[];
  pagination: Pagination;
}

export interface ProfileSummary {
  id: number;
  username: string;
  email: string;
  school: string;
  avatar_url?: string | null;
  points: number;
  uploaded_count: number;
}

export interface TopUploader {
  id: number;
  username: string;
  avatar_url?: string | null;
  points: number;
  uploaded_count: number;
}

export interface UpdateProfilePayload {
  username: string;
  email: string;
  school: string;
}

export interface DownloadAction {
  resource_id: number;
  download_url: string;
}

export interface ResourceFilters {
  keyword?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateMyResourcePayload {
  description: string;
  file?: File | null;
}
