const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api/v1";

export function getApiBaseUrl() {
  return apiBaseUrl;
}

export function resolveBackendUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const origin = new URL(apiBaseUrl).origin;
  return new URL(path, origin).toString();
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date?: string) {
  if (!date) {
    return "刚刚更新";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
