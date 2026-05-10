from html import escape
from io import BytesIO
import json
from pathlib import Path
from typing import Any
from urllib.parse import quote
from uuid import uuid5, NAMESPACE_URL
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
from app.schemas.resource import (
    ChunkUploadResponse,
    ChunkedUploadInitRequest,
    ChunkedUploadInitResponse,
    DownloadActionResponse,
    ResourceListResponse,
    ResourceResponse,
)
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

    def get_user_resource(self, *, resource_id: int, user_id: int) -> Resource:
        statement = (
            select(Resource)
            .options(joinedload(Resource.uploader))
            .where(Resource.id == resource_id, Resource.uploader_id == user_id)
        )
        resource = self.db.execute(statement).scalar_one_or_none()
        if resource is None:
            raise AppException(message="resource not found", code=4042, status_code=404)
        return resource

    def update_user_resource(
        self,
        *,
        resource_id: int,
        current_user: User,
        description: str,
        upload_file: UploadFile | None = None,
    ) -> Resource:
        resource = self.get_user_resource(resource_id=resource_id, user_id=current_user.id)
        resource.description = description

        if upload_file is not None and upload_file.filename:
            old_file_path = resource.file_path
            stored_filename, file_path, file_size = save_upload_file(upload_file)
            resource.original_filename = upload_file.filename or stored_filename
            resource.stored_filename = stored_filename
            resource.file_path = file_path
            resource.file_size = file_size
            resource.mime_type = upload_file.content_type or "application/octet-stream"
            cos_utils.delete_object(old_file_path)

        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def init_chunked_upload(
        self,
        *,
        current_user: User,
        payload: ChunkedUploadInitRequest,
    ) -> ChunkedUploadInitResponse:
        self._validate_upload_size(payload.file_size)
        if payload.chunk_size <= 0:
            raise AppException(message="invalid chunk size", code=4009, status_code=400)

        upload_id = self._build_upload_id(current_user.id, payload.file_key)
        session_dir = self._chunk_session_dir(upload_id)
        chunks_dir = session_dir / "chunks"
        chunks_dir.mkdir(parents=True, exist_ok=True)

        metadata_path = session_dir / "metadata.json"
        if metadata_path.exists():
            metadata = self._read_chunk_metadata(session_dir)
            if metadata["user_id"] != current_user.id:
                raise AppException(message="chunked upload not found", code=4044, status_code=404)
            if metadata["file_size"] != payload.file_size or metadata["filename"] != payload.filename:
                raise AppException(message="chunked upload metadata mismatch", code=4010, status_code=400)
        else:
            metadata = {
                "user_id": current_user.id,
                "file_key": payload.file_key,
                "filename": payload.filename,
                "file_size": payload.file_size,
                "mime_type": payload.mime_type or "application/octet-stream",
                "chunk_size": payload.chunk_size,
            }
            metadata_path.write_text(json.dumps(metadata), encoding="utf-8")

        return ChunkedUploadInitResponse(
            upload_id=upload_id,
            uploaded_chunks=self._uploaded_chunk_indexes(session_dir),
            chunk_size=int(metadata["chunk_size"]),
            max_file_size=self._max_upload_size_bytes(),
        )

    def save_chunk(
        self,
        *,
        current_user: User,
        upload_id: str,
        chunk_index: int,
        upload_file: UploadFile,
    ) -> ChunkUploadResponse:
        if chunk_index < 0:
            raise AppException(message="invalid chunk index", code=4011, status_code=400)

        session_dir = self._authorized_chunk_session_dir(current_user, upload_id)
        metadata = self._read_chunk_metadata(session_dir)
        content = upload_file.file.read()
        if len(content) > int(metadata["chunk_size"]):
            raise AppException(message="chunk too large", code=4012, status_code=400)

        chunk_path = session_dir / "chunks" / f"{chunk_index}.part"
        chunk_path.write_bytes(content)
        return ChunkUploadResponse(upload_id=upload_id, uploaded_chunks=self._uploaded_chunk_indexes(session_dir))

    def complete_chunked_upload(
        self,
        *,
        current_user: User,
        upload_id: str,
        description: str,
    ) -> Resource:
        session_dir = self._authorized_chunk_session_dir(current_user, upload_id)
        metadata = self._read_chunk_metadata(session_dir)
        uploaded_chunks = self._uploaded_chunk_indexes(session_dir)
        expected_chunks = (int(metadata["file_size"]) + int(metadata["chunk_size"]) - 1) // int(metadata["chunk_size"])
        missing_chunks = [index for index in range(expected_chunks) if index not in uploaded_chunks]
        if missing_chunks:
            raise AppException(message="missing upload chunks", code=4013, status_code=400)

        chunks_dir = session_dir / "chunks"
        content = b"".join((chunks_dir / f"{index}.part").read_bytes() for index in range(expected_chunks))
        if len(content) != int(metadata["file_size"]):
            raise AppException(message="chunked upload size mismatch", code=4014, status_code=400)

        object_key = cos_utils.generate_object_key(str(metadata["filename"]))
        stored_filename = Path(object_key).name
        cos_utils.upload_bytes(
            key=object_key,
            body=content,
            content_type=str(metadata["mime_type"] or "application/octet-stream"),
        )

        resource = Resource(
            description=description,
            original_filename=str(metadata["filename"]),
            stored_filename=stored_filename,
            file_path=object_key,
            file_size=len(content),
            mime_type=str(metadata["mime_type"] or "application/octet-stream"),
            uploader_id=current_user.id,
        )
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        self._delete_chunk_session(session_dir)
        return resource

    def delete_user_resource(self, *, resource_id: int, current_user: User) -> int:
        resource = self.get_user_resource(resource_id=resource_id, user_id=current_user.id)
        self.db.query(DownloadRecord).filter(DownloadRecord.resource_id == resource.id).delete()
        self.db.delete(resource)
        self.db.commit()
        cos_utils.delete_object(resource.file_path)
        return resource.id

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
            "avatar_url": current_user.avatar_url,
            "points": current_user.points,
            "uploaded_count": resources_count,
        }

    def _max_upload_size_bytes(self) -> int:
        return self.settings.max_upload_size_mb * 1024 * 1024

    def _validate_upload_size(self, file_size: int) -> None:
        if file_size > self._max_upload_size_bytes():
            raise AppException(message="file too large", code=4005, status_code=400)

    def _chunk_root_dir(self) -> Path:
        path = Path(self.settings.upload_dir).parent / "upload_chunks"
        path.mkdir(parents=True, exist_ok=True)
        return path

    def _build_upload_id(self, user_id: int, file_key: str) -> str:
        return uuid5(NAMESPACE_URL, f"examstack:{user_id}:{file_key}").hex

    def _chunk_session_dir(self, upload_id: str) -> Path:
        return self._chunk_root_dir() / upload_id

    def _authorized_chunk_session_dir(self, current_user: User, upload_id: str) -> Path:
        session_dir = self._chunk_session_dir(upload_id)
        if not session_dir.exists():
            raise AppException(message="chunked upload not found", code=4044, status_code=404)
        metadata = self._read_chunk_metadata(session_dir)
        if metadata["user_id"] != current_user.id:
            raise AppException(message="chunked upload not found", code=4044, status_code=404)
        return session_dir

    def _read_chunk_metadata(self, session_dir: Path) -> dict[str, Any]:
        metadata_path = session_dir / "metadata.json"
        if not metadata_path.exists():
            raise AppException(message="chunked upload not found", code=4044, status_code=404)
        return json.loads(metadata_path.read_text(encoding="utf-8"))

    def _uploaded_chunk_indexes(self, session_dir: Path) -> list[int]:
        chunks_dir = session_dir / "chunks"
        if not chunks_dir.exists():
            return []
        return sorted(
            int(path.stem)
            for path in chunks_dir.glob("*.part")
            if path.stem.isdigit()
        )

    def _delete_chunk_session(self, session_dir: Path) -> None:
        chunks_dir = session_dir / "chunks"
        if chunks_dir.exists():
            for chunk_path in chunks_dir.glob("*.part"):
                chunk_path.unlink()
            chunks_dir.rmdir()
        metadata_path = session_dir / "metadata.json"
        if metadata_path.exists():
            metadata_path.unlink()
        if session_dir.exists():
            session_dir.rmdir()
