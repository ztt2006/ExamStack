from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.response import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UpdateProfileRequest, UserResponse
from app.services.resource_service import ResourceService
from app.services.user_service import UserService


router = APIRouter()


@router.get("/me/profile")
def my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = ResourceService(db).profile_summary(current_user)
    return success_response(payload)


@router.put("/me/profile")
def update_my_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = UserService(db).update_profile(current_user, payload)
    return success_response(UserResponse.model_validate(user).model_dump(mode="json"))


@router.get("/me/resources")
def my_resources(
    current_user: User = Depends(get_current_user),
    keyword: str | None = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
):
    payload = ResourceService(db).list_user_resources(
        user_id=current_user.id,
        keyword=keyword,
        page=page,
        page_size=page_size,
    )
    return success_response(payload.model_dump(mode="json"))


@router.get("/me/resources/{resource_id}")
def my_resource_detail(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = ResourceService(db).get_user_resource(resource_id=resource_id, user_id=current_user.id)
    return success_response(ResourceService(db).to_response(resource).model_dump(mode="json"))


@router.put("/me/resources/{resource_id}")
def update_my_resource(
    resource_id: int,
    description: str = Form(...),
    file: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = ResourceService(db).update_user_resource(
        resource_id=resource_id,
        current_user=current_user,
        description=description,
        upload_file=file,
    )
    return success_response(ResourceService(db).to_response(resource).model_dump(mode="json"))


@router.delete("/me/resources/{resource_id}")
def delete_my_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted_id = ResourceService(db).delete_user_resource(resource_id=resource_id, current_user=current_user)
    return success_response({"id": deleted_id})
