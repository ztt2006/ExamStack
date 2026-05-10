from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    school: str
    points: int
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    school: str = Field(min_length=2, max_length=120)
