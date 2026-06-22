from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Type, Dict, Any
from datetime import date, time

# --- Base and Version 1.0 Schemas ---

class AITaskImportV1(BaseModel):
    title: str
    description: Optional[str] = None
    task_date: Optional[date] = Field(None, alias="date")
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    priority: Optional[str] = None
    category: Optional[str] = None

class AIScheduleImportV1(BaseModel):
    version: str = "1.0"
    title: str
    description: Optional[str] = None
    tasks: List[AITaskImportV1] = []

# --- Schema Registry ---

class VersionRegistry:
    _schemas: Dict[str, Type[BaseModel]] = {
        "1.0": AIScheduleImportV1
    }

    @classmethod
    def get_schema(cls, version: str) -> Type[BaseModel]:
        if version not in cls._schemas:
            raise ValueError(f"Unsupported schema version: '{version}'. Supported versions are: {', '.join(cls._schemas.keys())}")
        return cls._schemas[version]

# --- Response Models ---

class ImportWarning(BaseModel):
    task_title: Optional[str] = None
    issue: str
    type: str  # e.g., "overlap", "duplicate", "invalid_time"

class PreviewResponse(BaseModel):
    version: str
    schedule: AIScheduleImportV1
    warnings: List[ImportWarning]
    total_tasks: int
