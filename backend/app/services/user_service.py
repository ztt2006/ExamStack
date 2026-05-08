from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.core.security import get_password_hash, verify_password
from app.models.point_transaction import PointTransaction
from app.models.user import User
from app.schemas.auth import RegisterRequest


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_by_account(self, account: str) -> User | None:
        statement = select(User).where(or_(User.username == account, User.email == account))
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
