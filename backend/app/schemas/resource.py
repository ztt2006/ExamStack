from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import PaginationMeta


class ResourceResponse(BaseModel):
    id: int
    title: str
    description: str
    term: str
    resource_type: str
    tags: list[str]
    original_filename: str
    mime_type: str
    file_size: int
    download_count: int
    subject_id: int
    subject_name: str
    uploader_id: int
    uploader_name: str
    preview_url: str
    download_url: str
    created_at: datetime | None = None


class ResourceListResponse(BaseModel):
    items: list[ResourceResponse]
    pagination: PaginationMeta


class DownloadActionResponse(BaseModel):
    resource_id: int
    download_url: str
    points_after: int
