from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.token import TokenPayload

async def sync_user_from_token(db: AsyncSession, payload: TokenPayload) -> User:
    """
    Synchronizes the user profile based on the verified JWT token.
    If the user doesn't exist locally, creates a new User record.
    """
    # Look up user by email
    query = select(User).where(User.email == payload.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        # Create user if it doesn't exist locally
        # hashed_password is left null as authentication is handled by the external provider
        user = User(
            email=payload.email,
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    return user
