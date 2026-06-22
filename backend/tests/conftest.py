import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import uuid
import datetime

from app.db.base_class import Base
from app.db.session import get_db
from app.main import app
from app.api.deps import get_token_verifier
from app.core.security.verifier import TokenVerifier
from app.schemas.token import TokenPayload
from app.models.user import User

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
TestingSessionLocal = async_sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

# Mock Verifier
class MockTokenVerifier(TokenVerifier):
    def __init__(self, valid: bool = True, sub: str = "mock-sub", email: str = "test@example.com"):
        self.valid = valid
        self.payload = TokenPayload(sub=sub, email=email, exp=9999999999)
        
    async def verify_token(self, token: str) -> TokenPayload:
        if token == "expired":
            from app.core.security.exceptions import TokenExpiredError
            raise TokenExpiredError("Token expired")
        if not self.valid or token == "invalid":
            from app.core.security.exceptions import InvalidTokenError
            raise InvalidTokenError("Invalid token")
        return self.payload

@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestingSessionLocal() as session:
        yield session
        
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def test_user(db_session: AsyncSession) -> User:
    user = User(email="test@example.com", is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture(scope="function")
async def other_user(db_session: AsyncSession) -> User:
    user = User(email="other@example.com", is_active=True)
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session
        
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
        
    app.dependency_overrides.clear()

@pytest_asyncio.fixture(scope="function")
def normal_user_token_headers(test_user: User) -> dict:
    app.dependency_overrides[get_token_verifier] = lambda: MockTokenVerifier(email=test_user.email)
    return {"Authorization": "Bearer valid_token"}

@pytest_asyncio.fixture(scope="function")
def other_user_token_headers(other_user: User) -> dict:
    app.dependency_overrides[get_token_verifier] = lambda: MockTokenVerifier(email=other_user.email)
    return {"Authorization": "Bearer valid_other_token"}

@pytest_asyncio.fixture(scope="function")
async def test_schedule(db_session: AsyncSession, test_user: User):
    from app.models.schedule import Schedule
    schedule = Schedule(title="Test Schedule", description="A test schedule", owner_id=test_user.id)
    db_session.add(schedule)
    await db_session.commit()
    await db_session.refresh(schedule)
    return schedule

@pytest_asyncio.fixture(scope="function")
async def test_task(db_session: AsyncSession, test_schedule):
    from app.models.task import Task
    task = Task(
        title="Test Task",
        schedule_id=test_schedule.id,
        completed=False
    )
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)
    return task

@pytest.fixture
def import_payload_v1():
    return {
        "version": "1.0",
        "title": "Imported Schedule",
        "tasks": [
            {
                "title": "Task 1",
                "date": "2026-06-25",
                "start_time": "10:00:00",
                "end_time": "11:00:00"
            }
        ]
    }
