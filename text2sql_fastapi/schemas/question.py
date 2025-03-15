from pydantic import BaseModel
from typing import Optional, Type, Any


class Question(BaseModel):
    question: str
