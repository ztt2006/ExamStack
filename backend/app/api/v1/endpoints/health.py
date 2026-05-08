from fastapi import APIRouter

from app.core.response import success_response


router = APIRouter()


@router.get("/health")
def health_check():
    return success_response({"service": "examstack-api", "status": "ok"})
