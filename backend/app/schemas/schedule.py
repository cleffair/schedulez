from pydantic import BaseModel, ConfigDict
from typing import Optional
import uuid
from datetime import datetime

class ScheduleBase(BaseModel):
    title: str
    description: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(ScheduleBase):
    title: Optional[str] = None

class ScheduleResponse(ScheduleBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
