from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.schemas.ai_import import VersionRegistry, AIScheduleImportV1, ImportWarning
from app.models.schedule import Schedule
from app.models.task import Task

class ImportService:
    @staticmethod
    def validate_payload(payload: Dict[str, Any]) -> AIScheduleImportV1:
        """
        Validates the raw dictionary payload against the versioned schema registry.
        Returns the parsed Pydantic model or raises ValueError/ValidationError.
        """
        version = payload.get("version")
        if not version:
            raise ValueError("Missing 'version' in payload.")
            
        SchemaClass = VersionRegistry.get_schema(version)
        # Parse and validate the payload using Pydantic
        # This will raise pydantic.ValidationError if structural/type requirements fail
        return SchemaClass(**payload)

    @staticmethod
    def detect_conflicts(schedule: AIScheduleImportV1) -> List[ImportWarning]:
        """
        Analyzes the schedule for logical conflicts like overlaps, duplicates,
        and invalid time ranges. Returns a list of warnings.
        """
        warnings: List[ImportWarning] = []
        
        # Sort tasks by date and start_time to easily check overlaps
        # Filter out tasks that don't have date or start_time for overlap logic
        scheduled_tasks = [t for t in schedule.tasks if t.task_date and t.start_time and t.end_time]
        scheduled_tasks.sort(key=lambda x: (x.task_date, x.start_time))

        seen_signatures = set()

        for i, task in enumerate(schedule.tasks):
            # Check Invalid Time Range
            if task.start_time and task.end_time:
                if task.start_time >= task.end_time:
                    warnings.append(ImportWarning(
                        task_title=task.title,
                        issue=f"Start time ({task.start_time}) is after or equal to end time ({task.end_time}).",
                        type="invalid_time"
                    ))
            
            # Check Duplicates
            sig = (task.title, task.task_date, task.start_time, task.end_time)
            if sig in seen_signatures:
                warnings.append(ImportWarning(
                    task_title=task.title,
                    issue="Duplicate task detected with exact same title and time boundaries.",
                    type="duplicate"
                ))
            seen_signatures.add(sig)

        # Check Overlaps
        for i in range(len(scheduled_tasks) - 1):
            current = scheduled_tasks[i]
            next_task = scheduled_tasks[i+1]
            
            if current.task_date == next_task.task_date:
                if current.end_time > next_task.start_time:
                    warnings.append(ImportWarning(
                        task_title=next_task.title,
                        issue=f"Overlaps with preceding task '{current.title}' on {current.task_date}.",
                        type="overlap"
                    ))

        return warnings

    @staticmethod
    async def execute_import(db: AsyncSession, schedule: AIScheduleImportV1, owner_id: uuid.UUID) -> Schedule:
        """
        Translates the validated Pydantic model into database records.
        Executes within a single transaction implicitly via db.commit().
        """
        # Create Schedule
        db_schedule = Schedule(
            title=schedule.title,
            description=schedule.description,
            owner_id=owner_id
        )
        db.add(db_schedule)
        await db.flush() # Flush to generate the schedule ID
        
        # Create Tasks
        for t in schedule.tasks:
            db_task = Task(
                title=t.title,
                description=t.description,
                task_date=t.task_date,
                start_time=t.start_time,
                end_time=t.end_time,
                priority=t.priority,
                category=t.category,
                schedule_id=db_schedule.id,
                completed=False
            )
            db.add(db_task)
            
        await db.commit()
        await db.refresh(db_schedule)
        return db_schedule
