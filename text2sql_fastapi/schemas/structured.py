from pydantic import BaseModel
from typing import Optional, Type, Any


class UnifiedResponse(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[str]