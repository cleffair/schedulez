import jwt
from app.core.security.verifier import TokenVerifier
from app.schemas.token import TokenPayload
from fastapi import HTTPException, status

class AuthenticationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

class SupabaseHS256Verifier(TokenVerifier):
    def __init__(self, secret: str):
        self.secret = secret

    async def verify_token(self, token: str) -> TokenPayload:
        try:
            payload = jwt.decode(
                token,
                self.secret,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            return TokenPayload(**payload)
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.PyJWTError as e:
            raise AuthenticationError(f"Invalid token: {str(e)}")
        except Exception:
            raise AuthenticationError("Could not validate credentials")
