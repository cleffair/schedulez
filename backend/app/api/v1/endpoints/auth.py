from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.user import UserResponse
from app.core.security.verifier import TokenVerifier
from app.api.deps import get_token_verifier
from app.services.user_service import sync_user_from_token
from app.core.security.exceptions import AuthenticationError

router = APIRouter()
security = HTTPBearer()

@router.post("/sync", response_model=UserResponse)
async def sync_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    verifier: TokenVerifier = Depends(get_token_verifier),
    db: AsyncSession = Depends(get_db)
):
    """
    Synchronize the authenticated user with the local database.
    This endpoint validates the token from the frontend and creates
    the local user profile if it does not already exist.
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
        
    user = await sync_user_from_token(db, payload)
    return user
