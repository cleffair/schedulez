from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Tuple, Optional
import uuid
import datetime

from app.models.task import Task
from app.models.schedule import Schedule
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    async def create(db: AsyncSession, obj_in: TaskCreate, owner_id: uuid.UUID) -> Optional[Task]:
        # Verify schedule ownership first
        schedule_query = select(Schedule).where(
            Schedule.id == obj_in.schedule_id,
            Schedule.owner_id == owner_id,
            Schedule.deleted_at.is_(None)
        )
        result = await db.execute(schedule_query)
        schedule = result.scalar_one_or_none()
        
        if not schedule:
            return None # Schedule doesn't exist or doesn't belong to the user
            
        db_obj = Task(
            title=obj_in.title,
            description=obj_in.description,
            task_date=obj_in.task_date,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            priority=obj_in.priority,
            category=obj_in.category,
            schedule_id=obj_in.schedule_id,
            completed=False
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Task]:
        query = select(Task).join(Schedule).where(
            Task.id == id,
            Schedule.owner_id == owner_id,
            Task.deleted_at.is_(None),
            Schedule.deleted_at.is_(None)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_list(
        db: AsyncSession, 
        owner_id: uuid.UUID, 
        completed: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        date: Optional[datetime.date] = None,
        page: int = 1, 
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Tuple[List[Task], int]:
        base_query = select(Task).join(Schedule).where(
            Schedule.owner_id == owner_id,
            Task.deleted_at.is_(None),
            Schedule.deleted_at.is_(None)
        )
        
        # Apply filters
        if completed is not None:
            base_query = base_query.where(Task.completed == completed)
        if priority is not None:
            base_query = base_query.where(Task.priority == priority)
        if category is not None:
            base_query = base_query.where(Task.category == category)
        if date is not None:
            base_query = base_query.where(Task.task_date == date)
            
        # Count total
        count_query = select(func.count()).select_from(base_query.subquery())
        count_result = await db.execute(count_query)
        total = count_result.scalar_one()
        
        # Sorting
        # Handle custom sort mappings if needed, fallback to created_at
        if sort_by == "date":
            sort_column = Task.task_date
        else:
            sort_column = getattr(Task, sort_by, Task.created_at)
            
        if sort_desc:
            sort_column = sort_column.desc()
            
        # Pagination
        query = base_query.order_by(sort_column).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        items = result.scalars().all()
        
        return list(items), total

    @staticmethod
    async def update(db: AsyncSession, db_obj: Task, obj_in: TaskUpdate) -> Task:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Handle completion tracking logic
        if "completed" in update_data:
            if update_data["completed"] and not db_obj.completed:
                db_obj.completed_at = datetime.datetime.now(datetime.timezone.utc)
            elif not update_data["completed"] and db_obj.completed:
                db_obj.completed_at = None
                
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, db_obj: Task) -> Task:
        db_obj.deleted_at = func.now()
        db.add(db_obj)
        await db.commit()
        return db_obj
