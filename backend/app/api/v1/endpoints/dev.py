from fastapi import APIRouter

from app.core.exceptions import AppException


router = APIRouter()


@router.get("/dev/raise")
def raise_demo_error():
    raise AppException(message="demo error", code=4000, status_code=400)
