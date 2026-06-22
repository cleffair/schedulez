import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.schedule import Schedule
from app.models.task import Task
from app.models.user import User

pytestmark = pytest.mark.asyncio

async def test_import_validate_success(client: AsyncClient, normal_user_token_headers: dict, import_payload_v1: dict):
    response = await client.post("/api/v1/import/validate", json=import_payload_v1, headers=normal_user_token_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "valid"

async def test_import_validate_unsupported_version(client: AsyncClient, normal_user_token_headers: dict, import_payload_v1: dict):
    payload = import_payload_v1.copy()
    payload["version"] = "99.9"
    response = await client.post("/api/v1/import/validate", json=payload, headers=normal_user_token_headers)
    assert response.status_code == 400
    assert "Unsupported schema version" in response.json()["detail"]

async def test_import_validate_invalid_schema(client: AsyncClient, normal_user_token_headers: dict, import_payload_v1: dict):
    payload = import_payload_v1.copy()
    del payload["title"] # Missing required field
    response = await client.post("/api/v1/import/validate", json=payload, headers=normal_user_token_headers)
    assert response.status_code == 422

async def test_import_preview_conflicts(client: AsyncClient, normal_user_token_headers: dict, import_payload_v1: dict):
    payload = import_payload_v1.copy()
    payload["tasks"].append({
        "title": "Task 2 Overlap",
        "date": "2026-06-25",
        "start_time": "10:30:00",
        "end_time": "11:30:00"
    })
    payload["tasks"].append({
        "title": "Task 1", # Duplicate
        "date": "2026-06-25",
        "start_time": "10:00:00",
        "end_time": "11:00:00"
    })
    
    response = await client.post("/api/v1/import/preview", json=payload, headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["total_tasks"] == 3
    
    warnings = content["warnings"]
    assert any(w["type"] == "overlap" for w in warnings)
    assert any(w["type"] == "duplicate" for w in warnings)

async def test_import_execute(client: AsyncClient, normal_user_token_headers: dict, import_payload_v1: dict, db_session: AsyncSession, test_user: User):
    response = await client.post("/api/v1/import/execute", json=import_payload_v1, headers=normal_user_token_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == import_payload_v1["title"]
    assert content["owner_id"] == str(test_user.id)
    
    schedule_id = content["id"]
    
    # Verify tasks were created in DB
    result = await db_session.execute(select(Task).where(Task.schedule_id == schedule_id))
    tasks = result.scalars().all()
    assert len(tasks) == 1
    assert tasks[0].title == "Task 1"
