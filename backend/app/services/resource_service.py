from html import escape
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.parse import quote
from xml.etree import ElementTree
from zipfile import BadZipFile, ZipFile

from fastapi import UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.models.download_record import DownloadRecord
from app.models.resource import Resource
from app.models.user import User
from app.schemas.common import PaginationMeta
from app.schemas.resource import DownloadActionResponse, ResourceListResponse, ResourceResponse
from app.utils import cos as cos_utils
from app.utils.file import save_upload_file


class ResourceService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()

    def create_resource(
        self,
        *,
        current_user: User,
        description: str,
        upload_file: UploadFile,
    ) -> Resource:
        stored_filename, file_path, file_size = save_upload_file(upload_file)

        resource = Resource(
            description=description,
            original_filename=upload_file.filename or stored_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=upload_file.content_type or "application/octet-stream",
            uploader_id=current_user.id,
        )
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def list_resources(
        self,
        *,
        keyword: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> ResourceListResponse:
        statement: Select[tuple[Resource]] = (
            select(Resource)
            .options(joinedload(Resource.uploader))
            .order_by(Resource.created_at.desc(), Resource.id.desc())
        )

        if keyword:
            keyword_like = f"%{keyword}%"
            statement = statement.where(
                or_(
                    Resource.description.ilike(keyword_like),
                    Resource.original_filename.ilike(keyword_like),
                )
            )

        total = self.db.execute(select(func.count()).select_from(statement.subquery())).scalar_one()
        items = list(
            self.db.execute(statement.offset((page - 1) * page_size).limit(page_size)).scalars().unique().all()
        )
        return ResourceListResponse(
            items=[self.to_response(item) for item in items],
            pagination=PaginationMeta(total=total, page=page, page_size=page_size),
        )

    def list_user_resources(
        self,
        *,
        user_id: int,
        keyword: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> ResourceListResponse:
        statement: Select[tuple[Resource]] = (
            select(Resource)
            .options(joinedload(Resource.uploader))
            .where(Resource.uploader_id == user_id)
            .order_by(Resource.created_at.desc(), Resource.id.desc())
        )

        if keyword:
            keyword_like = f"%{keyword}%"
            statement = statement.where(
                or_(
                    Resource.description.ilike(keyword_like),
                    Resource.original_filename.ilike(keyword_like),
                )
            )

        total = self.db.execute(select(func.count()).select_from(statement.subquery())).scalar_one()
        items = list(
            self.db.execute(statement.offset((page - 1) * page_size).limit(page_size)).scalars().unique().all()
        )
        return ResourceListResponse(
            items=[self.to_response(item) for item in items],
            pagination=PaginationMeta(total=total, page=page, page_size=page_size),
        )

    def get_resource(self, resource_id: int) -> Resource:
        statement = (
            select(Resource)
            .options(joinedload(Resource.uploader))
            .where(Resource.id == resource_id)
        )
        resource = self.db.execute(statement).scalar_one_or_none()
        if resource is None:
            raise AppException(message="resource not found", code=4042, status_code=404)
        return resource

    def handle_download(self, resource_id: int, current_user: User) -> DownloadActionResponse:
        resource = self.get_resource(resource_id)
        resource.download_count += 1
        self.db.add(DownloadRecord(user_id=current_user.id, resource_id=resource.id))
        self.db.commit()
        return DownloadActionResponse(
            resource_id=resource.id,
            download_url=f"/api/v1/resources/{resource.id}/file",
        )

    def build_file_response(self, resource: Resource) -> StreamingResponse:
        stream, content_type = self._download_stream(resource)
        return StreamingResponse(
            stream,
            media_type=self._resolve_media_type(resource, content_type),
            headers={
                "Content-Disposition": self._build_content_disposition(
                    "attachment",
                    resource.original_filename,
                ),
            },
        )

    def build_preview_response(self, resource: Resource):
        if self._is_docx(resource):
            return HTMLResponse(content=self._render_docx_preview(resource), media_type="text/html")

        stream, content_type = self._download_stream(resource)
        return StreamingResponse(
            stream,
            media_type=self._resolve_media_type(resource, content_type),
            headers={
                "Content-Disposition": self._build_content_disposition(
                    "inline",
                    resource.original_filename,
                ),
            },
        )

    def to_response(self, resource: Resource) -> ResourceResponse:
        return ResourceResponse(
            id=resource.id,
            description=resource.description,
            original_filename=resource.original_filename,
            mime_type=resource.mime_type,
            file_size=resource.file_size,
            download_count=resource.download_count,
            uploader_id=resource.uploader_id,
            uploader_name=resource.uploader.username,
            preview_url=f"/api/v1/resources/{resource.id}/preview",
            download_url=f"/api/v1/resources/{resource.id}/file",
            created_at=resource.created_at,
        )

    def _is_docx(self, resource: Resource) -> bool:
        suffix = Path(resource.original_filename).suffix.lower()
        return (
            resource.mime_type
            == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            or suffix == ".docx"
        )

    def _download_stream(self, resource: Resource) -> tuple[BytesIO, str]:
        try:
            stream, content_type = cos_utils.download_stream(resource.file_path)
        except FileNotFoundError as exc:
            raise AppException(message="resource file not found", code=4043, status_code=404) from exc
        return stream, content_type

    def _resolve_media_type(self, resource: Resource, downloaded_content_type: str | None) -> str:
        if downloaded_content_type and downloaded_content_type != "application/octet-stream":
            return downloaded_content_type
        return resource.mime_type or "application/octet-stream"

    def _build_content_disposition(self, disposition_type: str, filename: str) -> str:
        safe_name = Path(filename).name
        ascii_fallback = safe_name.encode("ascii", "ignore").decode("ascii") or "download"
        encoded_name = quote(safe_name)
        return (
            f'{disposition_type}; filename="{ascii_fallback}"; '
            f"filename*=UTF-8''{encoded_name}"
        )

    def _render_docx_preview(self, resource: Resource) -> str:
        try:
            document_bytes, _ = cos_utils.download_bytes(resource.file_path)
            with ZipFile(BytesIO(document_bytes)) as archive:
                document_xml = archive.read("word/document.xml")
        except FileNotFoundError as exc:
            raise AppException(message="resource file not found", code=4043, status_code=404) from exc
        except (KeyError, BadZipFile) as exc:
            raise AppException(message="docx preview unavailable", code=4006, status_code=400) from exc

        namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        root = ElementTree.fromstring(document_xml)
        paragraphs: list[str] = []

        for paragraph in root.findall(".//w:body/w:p", namespace):
            parts = [node.text or "" for node in paragraph.findall(".//w:t", namespace)]
            text = "".join(parts).strip()
            if text:
                paragraphs.append(text)

        if not paragraphs:
            paragraphs = ["该 Word 文档暂时没有可提取的正文内容。"]

        rendered_paragraphs = "\n".join(
            f"<p>{escape(paragraph)}</p>" for paragraph in paragraphs
        )
        title = escape(resource.original_filename)
        description = escape(resource.description)

        return f"""<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <style>
      :root {{
        color-scheme: light;
        --bg: #f4faff;
        --paper: #ffffff;
        --border: #d8e8f6;
        --text: #1f3347;
        --muted: #67829a;
      }}
      * {{
        box-sizing: border-box;
      }}
      body {{
        margin: 0;
        padding: 24px;
        background: linear-gradient(180deg, #eef8ff 0%, var(--bg) 100%);
        color: var(--text);
        font: 16px/1.8 "Segoe UI", "Microsoft YaHei", sans-serif;
      }}
      main {{
        max-width: 880px;
        margin: 0 auto;
        padding: 28px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--paper);
        box-shadow: 0 18px 40px rgba(118, 162, 201, 0.12);
      }}
      h1 {{
        margin: 0;
        font-size: 24px;
        line-height: 1.3;
      }}
      .desc {{
        margin: 10px 0 24px;
        color: var(--muted);
      }}
      .doc {{
        display: grid;
        gap: 14px;
      }}
      p {{
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }}
    </style>
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p class="desc">{description}</p>
      <section class="doc">
        {rendered_paragraphs}
      </section>
    </main>
  </body>
</html>"""

    def profile_summary(self, current_user: User) -> dict[str, Any]:
        resources_count = self.db.execute(
            select(func.count()).select_from(Resource).where(Resource.uploader_id == current_user.id)
        ).scalar_one()
        return {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "school": current_user.school,
            "points": current_user.points,
            "uploaded_count": resources_count,
        }
