from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    school: str
    points: int
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
