from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid
from datetime import date, time, datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    task_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    completed: bool = False
    completed_at: Optional[datetime] = None

class TaskCreate(TaskBase):
    schedule_id: uuid.UUID

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: uuid.UUID
    schedule_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
