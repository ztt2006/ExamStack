from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import PaginationMeta


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    school: str
    avatar_url: str | None = None
    points: int
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    school: str = Field(min_length=2, max_length=120)


class AdminUserResponse(UserResponse):
    uploaded_count: int = 0
    download_count: int = 0


class AdminUserListResponse(BaseModel):
    items: list[AdminUserResponse]
    pagination: PaginationMeta


class AdminUpdateUserPointsRequest(BaseModel):
    points: int = Field(ge=0, le=100000)
    reason: str = Field(default="admin_adjustment", min_length=2, max_length=120)


class AdminUpdateUserProfileRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    school: str = Field(min_length=2, max_length=120)


class AdminResetUserPasswordRequest(BaseModel):
    password: str = Field(min_length=6, max_length=128)
