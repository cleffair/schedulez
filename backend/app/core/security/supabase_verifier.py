import jwt
from jwt.exceptions import ExpiredSignatureError, PyJWTError
from app.core.security.verifier import TokenVerifier
from app.schemas.token import TokenPayload
from app.core.security.exceptions import TokenExpiredError, InvalidTokenError

class SupabaseHS256Verifier(TokenVerifier):
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        # Supabase defaults to HS256 for the JWTs it issues.
        self.algorithms = ["HS256"]

    async def verify_token(self, token: str) -> TokenPayload:
        """
        Verifies the Supabase JWT token using HS256 algorithm.
        This is marked async to satisfy the TokenVerifier interface,
        even though HS256 verification is CPU bound and synchronous.
        """
        try:
            # The 'aud' is usually 'authenticated' for Supabase auth.
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=self.algorithms, 
                options={"verify_aud": False} # We could verify audience if needed
            )
            return TokenPayload(**payload)
        except ExpiredSignatureError as e:
            raise TokenExpiredError("Token has expired") from e
        except PyJWTError as e:
            raise InvalidTokenError("Invalid token") from e
        except Exception as e:
            raise InvalidTokenError("Error decoding token") from e
