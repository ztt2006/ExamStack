import { apiClient } from "@/api/client";
import type { ApiResponse, AuthToken, User } from "@/types";

export interface LoginPayload {
  account: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  school: string;
}

export async function register(payload: RegisterPayload) {
  const response = await apiClient.post<ApiResponse<User>>("/auth/register", payload);
  return response.data.data;
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<ApiResponse<AuthToken>>("/auth/login", payload);
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
}
