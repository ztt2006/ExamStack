from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.response import success_response
from app.db.session import get_db
from app.schemas.user import (
    AdminResetUserPasswordRequest,
    AdminUpdateUserPointsRequest,
    AdminUpdateUserProfileRequest,
)
from app.services.user_service import UserService


router = APIRouter()


@router.get("/users")
def list_users(
    _: object = Depends(get_current_user),
    keyword: str | None = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
):
    payload = UserService(db).list_admin_users(keyword=keyword, page=page, page_size=page_size)
    return success_response(payload.model_dump(mode="json"))


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: int,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = UserService(db).get_admin_user(user_id)
    return success_response(payload.model_dump(mode="json"))


@router.put("/users/{user_id}")
def update_user_profile(
    user_id: int,
    payload: AdminUpdateUserProfileRequest,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = UserService(db).update_admin_user_profile(user_id=user_id, payload=payload)
    return success_response(user.model_dump(mode="json"))


@router.patch("/users/{user_id}/points")
def update_user_points(
    user_id: int,
    payload: AdminUpdateUserPointsRequest,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = UserService(db).update_admin_user_points(user_id=user_id, payload=payload)
    return success_response(user.model_dump(mode="json"))


@router.patch("/users/{user_id}/password")
def reset_user_password(
    user_id: int,
    payload: AdminResetUserPasswordRequest,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = UserService(db).reset_admin_user_password(user_id=user_id, payload=payload)
    return success_response(user.model_dump(mode="json"))
