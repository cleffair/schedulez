import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task
from app.models.schedule import Schedule

pytestmark = pytest.mark.asyncio

async def test_create_task(client: AsyncClient, normal_user_token_headers: dict, test_schedule: Schedule):
    data = {
        "title": "New Task", 
        "schedule_id": str(test_schedule.id),
        "priority": "high",
        "category": "work"
    }
    response = await client.post("/api/v1/tasks/", json=data, headers=normal_user_token_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["schedule_id"] == data["schedule_id"]
    assert content["completed"] is False

async def test_create_task_wrong_schedule(client: AsyncClient, other_user_token_headers: dict, test_schedule: Schedule):
    # 'other_user' tries to create task in 'test_user's schedule
    data = {"title": "New Task", "schedule_id": str(test_schedule.id)}
    response = await client.post("/api/v1/tasks/", json=data, headers=other_user_token_headers)
    assert response.status_code == 404

async def test_read_tasks(client: AsyncClient, normal_user_token_headers: dict, test_task: Task):
    response = await client.get("/api/v1/tasks/", headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["total"] >= 1
    assert any(item["id"] == str(test_task.id) for item in content["items"])

async def test_update_task_completion(client: AsyncClient, normal_user_token_headers: dict, test_task: Task):
    data = {"completed": True}
    response = await client.patch(f"/api/v1/tasks/{test_task.id}", json=data, headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["completed"] is True
    assert content["completed_at"] is not None

async def test_delete_task_soft(client: AsyncClient, normal_user_token_headers: dict, test_task: Task, db_session: AsyncSession):
    response = await client.delete(f"/api/v1/tasks/{test_task.id}", headers=normal_user_token_headers)
    assert response.status_code == 200
    
    get_response = await client.get(f"/api/v1/tasks/{test_task.id}", headers=normal_user_token_headers)
    assert get_response.status_code == 404
    
    await db_session.refresh(test_task)
    assert test_task.deleted_at is not None

async def test_task_ownership_enforcement(client: AsyncClient, other_user_token_headers: dict, test_task: Task):
    response = await client.get(f"/api/v1/tasks/{test_task.id}", headers=other_user_token_headers)
    assert response.status_code == 404
