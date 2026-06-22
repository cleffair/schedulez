from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime

class UserBase(BaseModel):
    email: str
    is_active: bool = True

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
