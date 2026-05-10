const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000/api/v1'

export function getApiBaseUrl() {
  return apiBaseUrl
}

export function resolveBackendUrl(path?: string | null) {
  if (!path) {
    return ''
  }
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const origin = new URL(apiBaseUrl).origin
  return new URL(path, origin).toString()
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes)) {
    return '-'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(date?: string | null) {
  if (!date) {
    return '-'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatShortDate(date?: string | null) {
  if (!date) {
    return '刚刚'
  }
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function percent(value: number, total: number) {
  if (!total) {
    return 0
  }
  return Math.round((value / total) * 100)
}
