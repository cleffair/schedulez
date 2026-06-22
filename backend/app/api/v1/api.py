from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, schedules, tasks, imports

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(imports.router, prefix="/import", tags=["import"])
