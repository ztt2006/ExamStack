from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.security import get_password_hash, verify_password
from app.models.point_transaction import PointTransaction
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.user import UpdateProfileRequest


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

    def _local_static_path(self, static_url: str) -> Path | None:
        prefix = "/static/"
        if not static_url.startswith(prefix):
            return None
        relative_path = Path(static_url.removeprefix(prefix))
        return Path(self.settings.upload_dir) / relative_path
