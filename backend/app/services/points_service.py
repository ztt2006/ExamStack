from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.point_transaction import PointTransaction
from app.models.user import User


class PointsService:
    def __init__(self, db: Session):
        self.db = db

    def add_points(self, user: User, amount: int, reason: str) -> User:
        user.points += amount
        self.db.add(PointTransaction(user_id=user.id, change_amount=amount, reason=reason))
        self.db.flush()
        return user

    def deduct_points(self, user: User, amount: int, reason: str) -> User:
        if user.points < amount:
            raise AppException(message="insufficient points", code=4003, status_code=400)
        user.points -= amount
        self.db.add(PointTransaction(user_id=user.id, change_amount=-amount, reason=reason))
        self.db.flush()
        return user
