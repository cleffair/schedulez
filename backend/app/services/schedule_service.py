from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Tuple, Optional
import uuid

from app.models.schedule import Schedule
from app.models.task import Task
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate

class ScheduleService:
    @staticmethod
    async def create(db: AsyncSession, obj_in: ScheduleCreate, owner_id: uuid.UUID) -> Schedule:
        db_obj = Schedule(
            title=obj_in.title,
            description=obj_in.description,
            owner_id=owner_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def get_by_id(db: AsyncSession, id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Schedule]:
        query = select(Schedule).where(
            Schedule.id == id,
            Schedule.owner_id == owner_id,
            Schedule.deleted_at.is_(None)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_list(
        db: AsyncSession, 
        owner_id: uuid.UUID, 
        page: int = 1, 
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> Tuple[List[Schedule], int]:
        base_query = select(Schedule).where(
            Schedule.owner_id == owner_id,
            Schedule.deleted_at.is_(None)
        )
        
        # Count total
        count_query = select(func.count()).select_from(base_query.subquery())
        count_result = await db.execute(count_query)
        total = count_result.scalar_one()
        
        # Sorting
        sort_column = getattr(Schedule, sort_by, Schedule.created_at)
        if sort_desc:
            sort_column = sort_column.desc()
            
        # Pagination
        query = base_query.order_by(sort_column).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        items = result.scalars().all()
        
        return list(items), total

    @staticmethod
    async def update(db: AsyncSession, db_obj: Schedule, obj_in: ScheduleUpdate) -> Schedule:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, db_obj: Schedule) -> Schedule:
        db_obj.deleted_at = func.now()
        db.add(db_obj)
        
        # Soft delete associated tasks
        tasks_query = select(Task).where(Task.schedule_id == db_obj.id, Task.deleted_at.is_(None))
        tasks_result = await db.execute(tasks_query)
        for task in tasks_result.scalars():
            task.deleted_at = func.now()
            db.add(task)
            
        await db.commit()
        return db_obj
