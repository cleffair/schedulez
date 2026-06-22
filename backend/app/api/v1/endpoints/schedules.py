from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import math

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from app.schemas.pagination import PaginatedResponse
from app.services.schedule_service import ScheduleService

router = APIRouter()

@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    schedule_in: ScheduleCreate,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Create a new schedule.
    """
    schedule = await ScheduleService.create(db, obj_in=schedule_in, owner_id=current_user.id)
    return schedule

@router.get("/", response_model=PaginatedResponse[ScheduleResponse])
async def read_schedules(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_desc: bool = Query(True, description="Sort in descending order"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Retrieve schedules.
    """
    items, total = await ScheduleService.get_list(
        db, 
        owner_id=current_user.id,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{id}", response_model=ScheduleResponse)
async def read_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Get schedule by ID.
    """
    schedule = await ScheduleService.get_by_id(db, id=id, owner_id=current_user.id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return schedule

@router.patch("/{id}", response_model=ScheduleResponse)
async def update_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    schedule_in: ScheduleUpdate,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Update a schedule.
    """
    schedule = await ScheduleService.get_by_id(db, id=id, owner_id=current_user.id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
        
    schedule = await ScheduleService.update(db, db_obj=schedule, obj_in=schedule_in)
    return schedule

@router.delete("/{id}", response_model=ScheduleResponse)
async def delete_schedule(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Delete a schedule.
    """
    schedule = await ScheduleService.get_by_id(db, id=id, owner_id=current_user.id)
    if not schedule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
        
    schedule = await ScheduleService.delete(db, db_obj=schedule)
    return schedule
