import { apiClient } from "@/api/client";
import type {
  ApiResponse,
  DownloadAction,
  Resource,
  ResourceFilters,
  ResourceListPayload,
} from "@/types";

export interface UploadResourcePayload {
  description: string;
  file: File;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
  percent: number;
  uploadedChunks: number;
  totalChunks: number;
  resumed: boolean;
}

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const CHUNK_SIZE = 2 * 1024 * 1024;

export async function getResources(filters: ResourceFilters) {
  const response = await apiClient.get<ApiResponse<ResourceListPayload>>("/resources", {
    params: filters,
  });
  return response.data.data;
}

export async function getResourceDetail(resourceId: string) {
  const response = await apiClient.get<ApiResponse<Resource>>(`/resources/${resourceId}`);
  return response.data.data;
}

export async function uploadResource(payload: UploadResourcePayload) {
  if (payload.file.size > MAX_UPLOAD_SIZE) {
    throw new Error("文件不能超过 50MB。");
  }

  if (payload.file.size <= CHUNK_SIZE) {
    return uploadResourceDirect(payload);
  }

  return uploadResourceChunked(payload);
}

async function uploadResourceDirect(payload: UploadResourcePayload) {
  const formData = new FormData();
  formData.append("description", payload.description);
  formData.append("file", payload.file);

  const response = await apiClient.post<ApiResponse<Resource>>("/resources", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  payload.onProgress?.({
    percent: 100,
    uploadedChunks: 1,
    totalChunks: 1,
    resumed: false,
  });
  return response.data.data;
}

async function uploadResourceChunked(payload: UploadResourcePayload) {
  const totalChunks = Math.ceil(payload.file.size / CHUNK_SIZE);
  const fileKey = buildFileKey(payload.file);

  const initResponse = await apiClient.post<
    ApiResponse<{
      upload_id: string;
      uploaded_chunks: number[];
      chunk_size: number;
      max_file_size: number;
    }>
  >("/resources/chunked/init", {
    file_key: fileKey,
    filename: payload.file.name,
    file_size: payload.file.size,
    mime_type: payload.file.type || "application/octet-stream",
    chunk_size: CHUNK_SIZE,
  });

  const uploadId = initResponse.data.data.upload_id;
  const uploadedChunks = new Set(initResponse.data.data.uploaded_chunks);
  const resumed = uploadedChunks.size > 0;

  payload.onProgress?.({
    percent: Math.round((uploadedChunks.size / totalChunks) * 100),
    uploadedChunks: uploadedChunks.size,
    totalChunks,
    resumed,
  });

  for (let index = 0; index < totalChunks; index += 1) {
    if (uploadedChunks.has(index)) {
      continue;
    }

    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, payload.file.size);
    const chunk = payload.file.slice(start, end);
    const formData = new FormData();
    formData.append("upload_id", uploadId);
    formData.append("chunk_index", String(index));
    formData.append("file", chunk, `${payload.file.name}.part${index}`);

    const chunkResponse = await apiClient.post<
      ApiResponse<{
        upload_id: string;
        uploaded_chunks: number[];
      }>
    >("/resources/chunked/chunk", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    uploadedChunks.clear();
    chunkResponse.data.data.uploaded_chunks.forEach((chunkIndex) => uploadedChunks.add(chunkIndex));
    payload.onProgress?.({
      percent: Math.round((uploadedChunks.size / totalChunks) * 100),
      uploadedChunks: uploadedChunks.size,
      totalChunks,
      resumed,
    });
  }

  const completeResponse = await apiClient.post<ApiResponse<Resource>>("/resources/chunked/complete", {
    upload_id: uploadId,
    description: payload.description,
  });
  payload.onProgress?.({
    percent: 100,
    uploadedChunks: totalChunks,
    totalChunks,
    resumed,
  });

  return completeResponse.data.data;
}

function buildFileKey(file: File) {
  return [file.name, file.size, file.lastModified].join(":");
}

export function getMaxUploadSize() {
  return MAX_UPLOAD_SIZE;
}

export function getUploadChunkSize() {
  return CHUNK_SIZE;
}

export function shouldUseChunkedUpload(file: File) {
  return file.size > CHUNK_SIZE;
}

export async function downloadResource(resourceId: number) {
  const response = await apiClient.post<ApiResponse<DownloadAction>>(
    `/resources/${resourceId}/download`,
  );
  return response.data.data;
}
