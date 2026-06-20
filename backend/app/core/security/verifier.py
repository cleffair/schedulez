from typing import Protocol
from app.schemas.token import TokenPayload

class TokenVerifier(Protocol):
    async def verify_token(self, token: str) -> TokenPayload:
        ...
