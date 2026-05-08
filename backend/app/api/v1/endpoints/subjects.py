from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.response import success_response
from app.db.session import get_db
from app.schemas.subject import SubjectCreateRequest, SubjectResponse
from app.services.subject_service import SubjectService


router = APIRouter()


@router.post("")
def create_subject(
    payload: SubjectCreateRequest,
    _: object = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subject = SubjectService(db).create_subject(payload)
    return success_response(SubjectResponse.model_validate(subject).model_dump(), status_code=201)


@router.get("")
def list_subjects(db: Session = Depends(get_db)):
    subjects = SubjectService(db).list_subjects()
    return success_response([SubjectResponse.model_validate(subject).model_dump() for subject in subjects])
