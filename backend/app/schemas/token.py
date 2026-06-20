from pydantic import BaseModel
from typing import Optional

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: Optional[str] = None
    exp: int
