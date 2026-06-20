from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security.verifier import TokenVerifier
from app.api.dependencies import get_token_verifier, security
from app.schemas.user import User
from app.schemas.token import TokenPayload
from app.services.user_service import UserService

router = APIRouter()

@router.post("/sync", response_model=User)
async def sync_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    verifier: TokenVerifier = Depends(get_token_verifier),
    db: AsyncSession = Depends(get_db)
):
    """
    Validates the bearer token and creates the local user profile if missing.
    Returns the local user profile.
    """
    token = credentials.credentials
    payload: TokenPayload = await verifier.verify_token(token)
    
    user_model = await UserService.sync_user_from_token(db, payload)
    return user_model
