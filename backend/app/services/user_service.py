from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.security import get_password_hash, verify_password
from app.models.point_transaction import PointTransaction
from app.models.download_record import DownloadRecord
from app.models.resource import Resource
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.common import PaginationMeta
from app.schemas.user import (
    AdminUserListResponse,
    AdminUserResponse,
    AdminResetUserPasswordRequest,
    AdminUpdateUserProfileRequest,
    AdminUpdateUserPointsRequest,
    TopUploaderResponse,
    UpdateProfileRequest,
)


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_account(self, account: str) -> User | None:
        normalized_account = account.strip()
        if not normalized_account:
            return None

        statement = select(User).where(
            or_(
                User.username == normalized_account,
                func.lower(User.email) == normalized_account.lower(),
            )
        )
        return self.db.execute(statement).scalar_one_or_none()

    def create_user(self, payload: RegisterRequest) -> User:
        existing = self.get_by_account(payload.username) or self.get_by_account(payload.email)
        if existing:
            raise AppException(message="user already exists", code=4001, status_code=400)

        user = User(
            username=payload.username,
            email=payload.email,
            school=payload.school,
            hashed_password=get_password_hash(payload.password),
            points=self.settings.initial_user_points,
        )
        self.db.add(user)
        self.db.flush()
        self.db.add(
            PointTransaction(
                user_id=user.id,
                change_amount=self.settings.initial_user_points,
                reason="register_bonus",
            )
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, account: str, password: str) -> User:
        user = self.get_by_account(account)
        if user is None or not verify_password(password, user.hashed_password):
            raise AppException(message="invalid credentials", code=4013, status_code=401)
        return user

    def update_profile(self, current_user: User, payload: UpdateProfileRequest) -> User:
        username = payload.username.strip()
        email = payload.email.strip().lower()
        school = payload.school.strip()

        existing_username = self.db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if existing_username is not None and existing_username.id != current_user.id:
            raise AppException(message="username already exists", code=4002, status_code=400)

        existing_email = self.db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if existing_email is not None and existing_email.id != current_user.id:
            raise AppException(message="email already exists", code=4003, status_code=400)

        current_user.username = username
        current_user.email = email
        current_user.school = school
        self.db.add(current_user)
        self.db.commit()
        self.db.refresh(current_user)
        return current_user

    def update_avatar(self, current_user: User, upload_file: UploadFile) -> User:
        content_type = upload_file.content_type or ""
        if not content_type.startswith("image/"):
            raise AppException(message="avatar must be an image", code=4007, status_code=400)

        content = upload_file.file.read()
        max_size = min(self.settings.max_upload_size_mb, 5) * 1024 * 1024
        if len(content) > max_size:
            raise AppException(message="avatar file too large", code=4008, status_code=400)

        suffix = Path(upload_file.filename or "").suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
            suffix = ".jpg"

        avatar_dir = Path(self.settings.upload_dir) / "avatars"
        avatar_dir.mkdir(parents=True, exist_ok=True)
        filename = f"user-{current_user.id}-{uuid4().hex}{suffix}"
        file_path = avatar_dir / filename
        file_path.write_bytes(content)

        if current_user.avatar_url:
            previous_path = self._local_static_path(current_user.avatar_url)
            if previous_path and previous_path.is_file() and previous_path != file_path:
                previous_path.unlink()

        current_user.avatar_url = f"/static/avatars/{filename}"
        self.db.add(current_user)
        self.db.commit()
        self.db.refresh(current_user)
        return current_user

    def list_admin_users(
        self,
        *,
        keyword: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> AdminUserListResponse:
        statement = select(User).order_by(User.created_at.desc(), User.id.desc())

        if keyword:
            keyword_like = f"%{keyword.strip()}%"
            statement = statement.where(
                or_(
                    User.username.ilike(keyword_like),
                    User.email.ilike(keyword_like),
                    User.school.ilike(keyword_like),
                )
            )

        total = self.db.execute(select(func.count()).select_from(statement.subquery())).scalar_one()
        users = list(self.db.execute(statement.offset((page - 1) * page_size).limit(page_size)).scalars().all())
        return AdminUserListResponse(
            items=[self.to_admin_response(user) for user in users],
            pagination=PaginationMeta(total=total, page=page, page_size=page_size),
        )

    def list_top_uploaders(self, limit: int = 3) -> list[TopUploaderResponse]:
        upload_count = func.count(Resource.id).label("uploaded_count")
        statement = (
            select(User, upload_count)
            .join(Resource, Resource.uploader_id == User.id)
            .group_by(User.id)
            .order_by(upload_count.desc(), User.id.asc())
            .limit(limit)
        )
        rows = self.db.execute(statement).all()
        return [
            TopUploaderResponse(
                id=user.id,
                username=user.username,
                avatar_url=user.avatar_url,
                points=user.points,
                uploaded_count=int(count),
            )
            for user, count in rows
        ]

    def get_admin_user(self, user_id: int) -> AdminUserResponse:
        user = self.get_by_id(user_id)
        if user is None:
            raise AppException(message="user not found", code=4041, status_code=404)
        return self.to_admin_response(user)

    def update_admin_user_points(
        self,
        *,
        user_id: int,
        payload: AdminUpdateUserPointsRequest,
    ) -> AdminUserResponse:
        user = self.get_by_id(user_id)
        if user is None:
            raise AppException(message="user not found", code=4041, status_code=404)

        change_amount = payload.points - user.points
        user.points = payload.points
        self.db.add(user)
        self.db.add(
            PointTransaction(
                user_id=user.id,
                change_amount=change_amount,
                reason=payload.reason,
            )
        )
        self.db.commit()
        self.db.refresh(user)
        return self.to_admin_response(user)

    def update_admin_user_profile(
        self,
        *,
        user_id: int,
        payload: AdminUpdateUserProfileRequest,
    ) -> AdminUserResponse:
        user = self.get_by_id(user_id)
        if user is None:
            raise AppException(message="user not found", code=4041, status_code=404)

        username = payload.username.strip()
        email = payload.email.strip().lower()
        school = payload.school.strip()

        existing_username = self.db.execute(select(User).where(User.username == username)).scalar_one_or_none()
        if existing_username is not None and existing_username.id != user.id:
            raise AppException(message="username already exists", code=4002, status_code=400)

        existing_email = self.db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if existing_email is not None and existing_email.id != user.id:
            raise AppException(message="email already exists", code=4003, status_code=400)

        user.username = username
        user.email = email
        user.school = school
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self.to_admin_response(user)

    def reset_admin_user_password(
        self,
        *,
        user_id: int,
        payload: AdminResetUserPasswordRequest,
    ) -> AdminUserResponse:
        user = self.get_by_id(user_id)
        if user is None:
            raise AppException(message="user not found", code=4041, status_code=404)

        user.hashed_password = get_password_hash(payload.password)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return self.to_admin_response(user)

    def to_admin_response(self, user: User) -> AdminUserResponse:
        uploaded_count = self.db.execute(
            select(func.count()).select_from(Resource).where(Resource.uploader_id == user.id)
        ).scalar_one()
        download_count = self.db.execute(
            select(func.count()).select_from(DownloadRecord).where(DownloadRecord.user_id == user.id)
        ).scalar_one()
        return AdminUserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            school=user.school,
            avatar_url=user.avatar_url,
            points=user.points,
            created_at=user.created_at,
            uploaded_count=uploaded_count,
            download_count=download_count,
        )

    def _local_static_path(self, static_url: str) -> Path | None:
        prefix = "/static/"
        if not static_url.startswith(prefix):
            return None
        relative_path = Path(static_url.removeprefix(prefix))
        return Path(self.settings.upload_dir) / relative_path
