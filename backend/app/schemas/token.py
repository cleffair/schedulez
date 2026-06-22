from pydantic import BaseModel, ConfigDict
from typing import Optional

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: Optional[str] = None
    exp: int

    model_config = ConfigDict(extra="ignore")
