from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.services.user_service import UserService


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise AppException(message="authentication required", code=4010, status_code=401)

    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise AppException(message="invalid token", code=4011, status_code=401) from exc

    user = UserService(db).get_by_id(int(payload["sub"]))
    if user is None:
        raise AppException(message="user not found", code=4012, status_code=401)
    return user
