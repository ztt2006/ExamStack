from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.response import success_response
from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.user_service import UserService


router = APIRouter()


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = UserService(db).create_user(payload)
    return success_response(UserResponse.model_validate(user).model_dump(mode="json"), status_code=201)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = UserService(db).authenticate(payload.account, payload.password)
    token = create_access_token(str(user.id))
    return success_response(TokenResponse(access_token=token).model_dump())


@router.get("/me")
def current_user_info(current_user=Depends(get_current_user)):
    return success_response(UserResponse.model_validate(current_user).model_dump(mode="json"))
