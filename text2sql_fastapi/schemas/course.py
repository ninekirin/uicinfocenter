from pydantic import BaseModel
from typing import Optional, Type, Any


class CourseJSON(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[list[dict[str, Any]]]


class CourseStructured(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[str]


class CourseAnswer(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[str]
