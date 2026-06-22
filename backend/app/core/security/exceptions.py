class AuthenticationError(Exception):
    """Base exception for authentication errors."""
    pass

class TokenExpiredError(AuthenticationError):
    """Exception raised when a token has expired."""
    pass

class InvalidTokenError(AuthenticationError):
    """Exception raised when a token is invalid or signature verification fails."""
    pass
