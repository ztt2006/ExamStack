from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.response import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.resource import ChunkedUploadCompleteRequest, ChunkedUploadInitRequest
from app.services.resource_service import ResourceService


router = APIRouter()


@router.post("")
def create_resource(
    description: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = ResourceService(db).create_resource(
        current_user=current_user,
        description=description,
        upload_file=file,
    )
    return success_response(ResourceService(db).to_response(resource).model_dump(mode="json"), status_code=201)


@router.post("/chunked/init")
def init_chunked_upload(
    payload: ChunkedUploadInitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    response = ResourceService(db).init_chunked_upload(current_user=current_user, payload=payload)
    return success_response(response.model_dump(mode="json"))


@router.post("/chunked/chunk")
def upload_chunk(
    upload_id: str = Form(...),
    chunk_index: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    response = ResourceService(db).save_chunk(
        current_user=current_user,
        upload_id=upload_id,
        chunk_index=chunk_index,
        upload_file=file,
    )
    return success_response(response.model_dump(mode="json"))


@router.post("/chunked/complete")
def complete_chunked_upload(
    payload: ChunkedUploadCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = ResourceService(db).complete_chunked_upload(
        current_user=current_user,
        upload_id=payload.upload_id,
        description=payload.description,
    )
    return success_response(ResourceService(db).to_response(resource).model_dump(mode="json"), status_code=201)


@router.get("")
def list_resources(
    keyword: str | None = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
):
    payload = ResourceService(db).list_resources(
        keyword=keyword,
        page=page,
        page_size=page_size,
    )
    return success_response(payload.model_dump(mode="json"))


@router.get("/{resource_id}")
def get_resource_detail(resource_id: int, db: Session = Depends(get_db)):
    resource = ResourceService(db).get_resource(resource_id)
    return success_response(ResourceService(db).to_response(resource).model_dump(mode="json"))


@router.get("/{resource_id}/preview")
def preview_resource(resource_id: int, request: Request, db: Session = Depends(get_db)):
    service = ResourceService(db)
    resource = service.get_resource(resource_id)
    return service.build_preview_response(resource, range_header=request.headers.get("range"))


@router.get("/{resource_id}/file")
def get_resource_file(resource_id: int, db: Session = Depends(get_db)):
    service = ResourceService(db)
    resource = service.get_resource(resource_id)
    return service.build_file_response(resource)


@router.post("/{resource_id}/download")
def download_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = ResourceService(db).handle_download(resource_id, current_user)
    return success_response(payload.model_dump())
