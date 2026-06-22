from typing import Optional
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core.config import settings
from app.core.security.verifier import TokenVerifier
from app.core.security.supabase_verifier import SupabaseHS256Verifier
from app.core.security.exceptions import AuthenticationError
from app.models.user import User

security = HTTPBearer()

@lru_cache()
def get_token_verifier() -> TokenVerifier:
    """
    Returns a singleton instance of the TokenVerifier.
    Uses lru_cache to ensure only one instance is created.
    """
    return SupabaseHS256Verifier(secret_key=settings.SUPABASE_JWT_SECRET)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    verifier: TokenVerifier = Depends(get_token_verifier),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validates the token, extracts the user payload, and retrieves the corresponding
    local User record from the database.
    """
    token = credentials.credentials
    try:
        payload = await verifier.verify_token(token)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retrieve local user based on email (or sub/ID). 
    # Supabase uses auth.users, and the email is included in the payload.
    # Assuming email is the unique identifier for local user sync.
    query = select(User).where(User.email == payload.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found locally. Please authenticate to sync profile.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
        
    return user
