from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from functools import lru_cache

from app.core.config import settings
from app.db.session import get_db
from app.core.security.verifier import TokenVerifier
from app.core.security.supabase_verifier import SupabaseHS256Verifier
from app.schemas.token import TokenPayload
from app.models.user import User
from app.crud.user import user as crud_user

security = HTTPBearer()

@lru_cache()
def get_token_verifier() -> TokenVerifier:
    return SupabaseHS256Verifier(secret=settings.SUPABASE_JWT_SECRET)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    verifier: TokenVerifier = Depends(get_token_verifier),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload: TokenPayload = await verifier.verify_token(token)
    
    user_model = await crud_user.get_by_email(db, email=payload.email)
    if not user_model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    return user_model
