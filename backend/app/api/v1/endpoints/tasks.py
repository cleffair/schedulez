from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import math
import datetime
from typing import Optional

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.pagination import PaginatedResponse
from app.services.task_service import TaskService

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Create a new task.
    """
    task = await TaskService.create(db, obj_in=task_in, owner_id=current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Schedule not found or you do not have access to it"
        )
    return task

@router.get("/", response_model=PaginatedResponse[TaskResponse])
async def read_tasks(
    db: AsyncSession = Depends(get_db),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    category: Optional[str] = Query(None, description="Filter by category"),
    date: Optional[datetime.date] = Query(None, description="Filter by specific date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_desc: bool = Query(True, description="Sort in descending order"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Retrieve tasks.
    """
    items, total = await TaskService.get_list(
        db, 
        owner_id=current_user.id,
        completed=completed,
        priority=priority,
        category=category,
        date=date,
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

@router.get("/{id}", response_model=TaskResponse)
async def read_task(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Get task by ID.
    """
    task = await TaskService.get_by_id(db, id=id, owner_id=current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.patch("/{id}", response_model=TaskResponse)
async def update_task(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Update a task.
    """
    task = await TaskService.get_by_id(db, id=id, owner_id=current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
    task = await TaskService.update(db, db_obj=task, obj_in=task_in)
    return task

@router.delete("/{id}", response_model=TaskResponse)
async def delete_task(
    *,
    db: AsyncSession = Depends(get_db),
    id: uuid.UUID,
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Delete a task.
    """
    task = await TaskService.get_by_id(db, id=id, owner_id=current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
    task = await TaskService.delete(db, db_obj=task)
    return task
