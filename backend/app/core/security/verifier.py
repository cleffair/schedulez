from abc import ABC, abstractmethod
from app.schemas.token import TokenPayload

class TokenVerifier(ABC):
    """
    Abstract base class for token verification.
    This abstraction allows the application to remain independent of the specific
    JWT verification mechanism (e.g. HS256 local verification vs JWKS).
    """

    @abstractmethod
    async def verify_token(self, token: str) -> TokenPayload:
        """
        Verifies the provided JWT token and returns a strongly typed TokenPayload.
        
        Args:
            token (str): The JWT token string.
            
        Returns:
            TokenPayload: The validated token payload.
            
        Raises:
            Exception: An application-specific exception if validation fails.
        """
        pass
