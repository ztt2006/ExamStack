from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.subject import Subject
from app.schemas.subject import SubjectCreateRequest


class SubjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_subject(self, payload: SubjectCreateRequest) -> Subject:
        exists = self.db.execute(select(Subject).where(Subject.code == payload.code)).scalar_one_or_none()
        if exists:
            raise AppException(message="subject already exists", code=4002, status_code=400)

        subject = Subject(**payload.model_dump())
        self.db.add(subject)
        self.db.commit()
        self.db.refresh(subject)
        return subject

    def get_by_id(self, subject_id: int) -> Subject | None:
        return self.db.get(Subject, subject_id)

    def list_subjects(self) -> list[Subject]:
        statement = select(Subject).order_by(Subject.name.asc())
        return list(self.db.execute(statement).scalars().all())
