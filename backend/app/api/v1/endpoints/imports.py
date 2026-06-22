from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError
from typing import Dict, Any

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.import_service import ImportService
from app.schemas.ai_import import PreviewResponse
from app.schemas.schedule import ScheduleResponse

router = APIRouter()

@router.post("/validate")
async def validate_import(
    request: Request,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Validates the structure and types of the incoming JSON payload
    against the appropriate schema version.
    Returns 200 OK if valid. No database writes occur.
    """
    try:
        payload = await request.json()
        ImportService.validate_payload(payload)
        return {"status": "valid", "message": "Payload is structurally sound."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

@router.post("/preview", response_model=PreviewResponse)
async def preview_import(
    request: Request,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Validates the payload and performs conflict detection.
    Returns the parsed schedule, warnings, and task counts.
    No database writes occur.
    """
    try:
        payload = await request.json()
        parsed_schedule = ImportService.validate_payload(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

    warnings = ImportService.detect_conflicts(parsed_schedule)
    
    return {
        "version": parsed_schedule.version,
        "schedule": parsed_schedule,
        "warnings": warnings,
        "total_tasks": len(parsed_schedule.tasks)
    }

@router.post("/execute", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def execute_import(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Validates the payload and executes the database write.
    The imported schedule inherently belongs to the current user.
    """
    try:
        payload = await request.json()
        parsed_schedule = ImportService.validate_payload(payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())
        
    db_schedule = await ImportService.execute_import(db, parsed_schedule, owner_id=current_user.id)
    return db_schedule
