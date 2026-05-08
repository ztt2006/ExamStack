from fastapi import APIRouter

from app.api.v1.endpoints import auth, dev, health, resources, subjects, users


api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dev.router, tags=["dev"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
