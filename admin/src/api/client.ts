import axios from 'axios'
import { ElMessage } from 'element-plus'

import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { getApiBaseUrl } from '@/utils/format'

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '请求失败，请稍后重试'
    if (status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      void router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
      ElMessage.warning('登录状态已过期，请重新登录')
    } else if (!error.config?.silent) {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)
