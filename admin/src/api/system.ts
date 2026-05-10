import { apiClient } from '@/api/client'
import type { ApiResponse, SystemHealth } from '@/types'
import { getApiBaseUrl } from '@/utils/format'

export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiClient.get<ApiResponse<unknown>>('/health', {
      // @ts-expect-error Axios config extension used by our interceptor.
      silent: true,
    })
    return {
      apiBaseUrl: getApiBaseUrl(),
      online: true,
      message: response.data.message || '服务运行正常',
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      apiBaseUrl: getApiBaseUrl(),
      online: false,
      message: error instanceof Error ? error.message : '服务不可用',
      checkedAt: new Date().toISOString(),
    }
  }
}
