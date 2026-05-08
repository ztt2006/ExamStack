from pydantic import BaseModel, Field


class SubjectCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=50)
    category: str = Field(min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=500)


class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    category: str
    description: str | None = None

    model_config = {"from_attributes": True}
