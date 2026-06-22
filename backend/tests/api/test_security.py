import pytest
from httpx import AsyncClient
from app.models.schedule import Schedule
from app.models.task import Task
from app.models.user import User

pytestmark = pytest.mark.asyncio

async def test_cross_user_schedule_access(client: AsyncClient, other_user_token_headers: dict, test_schedule: Schedule):
    # User A (other_user) tries to fetch User B's (test_user) schedule
    response = await client.get(f"/api/v1/schedules/{test_schedule.id}", headers=other_user_token_headers)
    assert response.status_code == 404

async def test_forged_ownership_schedule_creation(client: AsyncClient, normal_user_token_headers: dict, test_user: User, other_user: User):
    # User A tries to create a schedule pretending to be User B
    data = {
        "title": "Forged Schedule",
        "owner_id": str(other_user.id) # Attempting forgery
    }
    response = await client.post("/api/v1/schedules/", json=data, headers=normal_user_token_headers)
    assert response.status_code == 201
    
    content = response.json()
    # The API should ignore the forged owner_id and assign it to the authenticated user
    assert content["owner_id"] == str(test_user.id)
    assert content["owner_id"] != str(other_user.id)

async def test_unauthorized_request(client: AsyncClient):
    response = await client.get("/api/v1/schedules/")
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authenticated"

async def test_cross_user_task_creation(client: AsyncClient, other_user_token_headers: dict, test_schedule: Schedule):
    # other_user tries to create a task on test_user's schedule
    data = {
        "title": "Forged Task",
        "schedule_id": str(test_schedule.id)
    }
    response = await client.post("/api/v1/tasks/", json=data, headers=other_user_token_headers)
    assert response.status_code == 404
