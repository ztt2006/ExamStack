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
  title: string;
  description: string;
  term: string;
  resource_type: string;
  tags: string[];
  original_filename: string;
  mime_type: string;
  file_size: number;
  download_count: number;
  subject_id: number;
  subject_name: string;
  uploader_id: number;
  uploader_name: string;
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
  points: number;
  uploaded_count: number;
}

export interface DownloadAction {
  resource_id: number;
  download_url: string;
  points_after: number;
}

export interface ResourceFilters {
  keyword?: string;
  subject_id?: number;
  resource_type?: string;
  page?: number;
  page_size?: number;
}
