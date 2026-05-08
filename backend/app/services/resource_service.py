from typing import Any

from fastapi import UploadFile
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.models.download_record import DownloadRecord
from app.models.resource import Resource
from app.models.user import User
from app.schemas.common import PaginationMeta
from app.schemas.resource import DownloadActionResponse, ResourceListResponse, ResourceResponse
from app.services.points_service import PointsService
from app.services.subject_service import SubjectService
from app.utils.file import normalize_resource_type, save_upload_file


class ResourceService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()
        self.points_service = PointsService(db)
        self.subject_service = SubjectService(db)

    def create_resource(
        self,
        *,
        current_user: User,
        title: str,
        description: str,
        subject_id: int,
        term: str,
        resource_type: str,
        tags: str,
        upload_file: UploadFile,
    ) -> Resource:
        subject = self.subject_service.get_by_id(subject_id)
        if subject is None:
            raise AppException(message="subject not found", code=4041, status_code=404)

        normalized_type = normalize_resource_type(resource_type)
        stored_filename, file_path, file_size = save_upload_file(upload_file)

        resource = Resource(
            title=title,
            description=description,
            term=term,
            resource_type=normalized_type,
            tags=tags,
            original_filename=upload_file.filename or stored_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=upload_file.content_type or "application/octet-stream",
            uploader_id=current_user.id,
            subject_id=subject_id,
        )
        self.db.add(resource)
        self.points_service.add_points(current_user, self.settings.upload_reward_points, "upload_reward")
        self.db.commit()
        self.db.refresh(resource)
        return resource

    def list_resources(
        self,
        *,
        keyword: str | None = None,
        subject_id: int | None = None,
        resource_type: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> ResourceListResponse:
        statement: Select[tuple[Resource]] = (
            select(Resource)
            .options(joinedload(Resource.subject), joinedload(Resource.uploader))
            .order_by(Resource.created_at.desc(), Resource.id.desc())
        )

        if keyword:
            keyword_like = f"%{keyword}%"
            statement = statement.where(
                or_(
                    Resource.title.ilike(keyword_like),
                    Resource.description.ilike(keyword_like),
                    Resource.tags.ilike(keyword_like),
                )
            )
        if subject_id:
            statement = statement.where(Resource.subject_id == subject_id)
        if resource_type:
            statement = statement.where(Resource.resource_type == normalize_resource_type(resource_type))

        total = self.db.execute(select(func.count()).select_from(statement.subquery())).scalar_one()
        items = list(
            self.db.execute(statement.offset((page - 1) * page_size).limit(page_size)).scalars().unique().all()
        )
        return ResourceListResponse(
            items=[self.to_response(item) for item in items],
            pagination=PaginationMeta(total=total, page=page, page_size=page_size),
        )

    def list_user_resources(self, *, user_id: int, page: int = 1, page_size: int = 10) -> ResourceListResponse:
        statement: Select[tuple[Resource]] = (
            select(Resource)
            .options(joinedload(Resource.subject), joinedload(Resource.uploader))
            .where(Resource.uploader_id == user_id)
            .order_by(Resource.created_at.desc(), Resource.id.desc())
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
            .options(joinedload(Resource.subject), joinedload(Resource.uploader))
            .where(Resource.id == resource_id)
        )
        resource = self.db.execute(statement).scalar_one_or_none()
        if resource is None:
            raise AppException(message="resource not found", code=4042, status_code=404)
        return resource

    def handle_download(self, resource_id: int, current_user: User) -> DownloadActionResponse:
        resource = self.get_resource(resource_id)
        self.points_service.deduct_points(current_user, self.settings.download_cost_points, "download_cost")
        resource.download_count += 1
        self.db.add(DownloadRecord(user_id=current_user.id, resource_id=resource.id))
        self.db.commit()
        self.db.refresh(current_user)
        return DownloadActionResponse(
            resource_id=resource.id,
            download_url=f"/api/v1/resources/{resource.id}/file",
            points_after=current_user.points,
        )

    def to_response(self, resource: Resource) -> ResourceResponse:
        return ResourceResponse(
            id=resource.id,
            title=resource.title,
            description=resource.description,
            term=resource.term,
            resource_type=resource.resource_type,
            tags=[tag for tag in resource.tags.split(",") if tag],
            original_filename=resource.original_filename,
            mime_type=resource.mime_type,
            file_size=resource.file_size,
            download_count=resource.download_count,
            subject_id=resource.subject_id,
            subject_name=resource.subject.name,
            uploader_id=resource.uploader_id,
            uploader_name=resource.uploader.username,
            preview_url=f"/api/v1/resources/{resource.id}/preview",
            download_url=f"/api/v1/resources/{resource.id}/file",
            created_at=resource.created_at,
        )

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
