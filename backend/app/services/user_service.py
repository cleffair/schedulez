from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.token import TokenPayload
from app.crud.user import user as crud_user
from app.schemas.user import UserCreate
from app.models.user import User

class UserService:
    @staticmethod
    async def sync_user_from_token(db: AsyncSession, payload: TokenPayload) -> User:
        """
        Syncs a user from the provided Supabase JWT payload.
        Creates the user if they do not exist.
        """
        user_model = await crud_user.get_by_email(db, email=payload.email)
        if not user_model:
            user_model = await crud_user.create(
                db, 
                obj_in=UserCreate(email=payload.email, is_active=True)
            )
        return user_model
