from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import PaginationMeta


class ResourceResponse(BaseModel):
    id: int
    description: str
    original_filename: str
    mime_type: str
    file_size: int
    download_count: int
    uploader_id: int
    uploader_name: str
    uploader_avatar_url: str | None = None
    preview_url: str
    download_url: str
    created_at: datetime | None = None


class ResourceListResponse(BaseModel):
    items: list[ResourceResponse]
    pagination: PaginationMeta


class DownloadActionResponse(BaseModel):
    resource_id: int
    download_url: str


class ChunkedUploadInitRequest(BaseModel):
    file_key: str
    filename: str
    file_size: int
    mime_type: str
    chunk_size: int


class ChunkedUploadInitResponse(BaseModel):
    upload_id: str
    uploaded_chunks: list[int]
    chunk_size: int
    max_file_size: int


class ChunkUploadResponse(BaseModel):
    upload_id: str
    uploaded_chunks: list[int]


class ChunkedUploadCompleteRequest(BaseModel):
    upload_id: str
    description: str
