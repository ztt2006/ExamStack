import { apiClient } from '@/api/client'
import type { SystemHealth } from '@/types'
import { getApiBaseUrl } from '@/utils/format'

interface HealthResponse {
  code: number
  message?: string
  data: unknown
}

export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiClient.get('/health', {
      // @ts-expect-error Axios config extension used by our interceptor.
      silent: true,
    })
    const payload = response.data as HealthResponse
    const message = payload.message
    return {
      apiBaseUrl: getApiBaseUrl(),
      online: true,
      message: typeof message === 'string' && message ? message : '服务运行正常',
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
