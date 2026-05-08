from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.response import success_response
from app.db.session import get_db
from app.models.user import User
from app.services.resource_service import ResourceService


router = APIRouter()


@router.get("/me/profile")
def my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = ResourceService(db).profile_summary(current_user)
    return success_response(payload)


@router.get("/me/resources")
def my_resources(
    current_user: User = Depends(get_current_user),
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
):
    payload = ResourceService(db).list_user_resources(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    return success_response(payload.model_dump(mode="json"))
