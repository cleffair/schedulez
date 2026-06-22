import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.schedule import Schedule
from app.models.user import User

pytestmark = pytest.mark.asyncio

async def test_create_schedule(client: AsyncClient, normal_user_token_headers: dict, test_user: User):
    data = {"title": "New Schedule", "description": "Desc"}
    response = await client.post("/api/v1/schedules/", json=data, headers=normal_user_token_headers)
    assert response.status_code == 201
    content = response.json()
    assert content["title"] == data["title"]
    assert content["owner_id"] == str(test_user.id)

async def test_read_schedules(client: AsyncClient, normal_user_token_headers: dict, test_schedule: Schedule):
    response = await client.get("/api/v1/schedules/", headers=normal_user_token_headers)
    assert response.status_code == 200
    content = response.json()
    assert content["total"] >= 1
    assert any(item["id"] == str(test_schedule.id) for item in content["items"])

async def test_read_schedule_by_id(client: AsyncClient, normal_user_token_headers: dict, test_schedule: Schedule):
    response = await client.get(f"/api/v1/schedules/{test_schedule.id}", headers=normal_user_token_headers)
    assert response.status_code == 200
    assert response.json()["id"] == str(test_schedule.id)

async def test_update_schedule(client: AsyncClient, normal_user_token_headers: dict, test_schedule: Schedule):
    data = {"title": "Updated Title"}
    response = await client.patch(f"/api/v1/schedules/{test_schedule.id}", json=data, headers=normal_user_token_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"

async def test_delete_schedule_soft(client: AsyncClient, normal_user_token_headers: dict, test_schedule: Schedule, db_session: AsyncSession):
    response = await client.delete(f"/api/v1/schedules/{test_schedule.id}", headers=normal_user_token_headers)
    assert response.status_code == 200
    
    # Verify it can no longer be retrieved via API
    get_response = await client.get(f"/api/v1/schedules/{test_schedule.id}", headers=normal_user_token_headers)
    assert get_response.status_code == 404
    
    # Verify it still exists in DB with deleted_at set
    await db_session.refresh(test_schedule)
    assert test_schedule.deleted_at is not None

async def test_schedule_ownership_enforcement(client: AsyncClient, other_user_token_headers: dict, test_schedule: Schedule):
    # 'other_user' tries to fetch 'test_user's schedule
    response = await client.get(f"/api/v1/schedules/{test_schedule.id}", headers=other_user_token_headers)
    assert response.status_code == 404
