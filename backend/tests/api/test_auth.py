import pytest
from httpx import AsyncClient
from app.main import app
from app.api.deps import get_token_verifier
from tests.conftest import MockTokenVerifier
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User

pytestmark = pytest.mark.asyncio

async def test_auth_missing_token(client: AsyncClient):
    response = await client.post("/api/v1/auth/sync")
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authenticated"

async def test_auth_invalid_token(client: AsyncClient):
    app.dependency_overrides[get_token_verifier] = lambda: MockTokenVerifier(valid=False)
    response = await client.post("/api/v1/auth/sync", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401
    assert "Invalid token" in response.json()["detail"]

async def test_auth_expired_token(client: AsyncClient):
    app.dependency_overrides[get_token_verifier] = lambda: MockTokenVerifier()
    response = await client.post("/api/v1/auth/sync", headers={"Authorization": "Bearer expired"})
    assert response.status_code == 401
    assert "Token expired" in response.json()["detail"]

async def test_auth_sync_new_user(client: AsyncClient, db_session: AsyncSession):
    app.dependency_overrides[get_token_verifier] = lambda: MockTokenVerifier(email="newuser@example.com")
    
    # User shouldn't exist
    result = await db_session.execute(select(User).where(User.email == "newuser@example.com"))
    assert result.scalar_one_or_none() is None

    response = await client.post("/api/v1/auth/sync", headers={"Authorization": "Bearer valid"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    
    # User should now exist
    result = await db_session.execute(select(User).where(User.email == "newuser@example.com"))
    assert result.scalar_one_or_none() is not None

async def test_auth_sync_existing_user(client: AsyncClient, test_user: User):
    app.dependency_overrides[get_token_verifier] = lambda: MockTokenVerifier(email=test_user.email)
    
    response = await client.post("/api/v1/auth/sync", headers={"Authorization": "Bearer valid"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["id"] == str(test_user.id)
