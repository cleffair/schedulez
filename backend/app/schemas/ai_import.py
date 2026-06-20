from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time

class AITaskImport(BaseModel):
    title: str
    description: Optional[str] = None
    task_date: Optional[date] = Field(None, alias="date")
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    priority: Optional[str] = None
    category: Optional[str] = None

class AIScheduleImport(BaseModel):
    version: str = "1.0"
    title: str
    description: Optional[str] = None
    tasks: List[AITaskImport] = []
