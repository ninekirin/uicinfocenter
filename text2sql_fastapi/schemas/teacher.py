from pydantic import BaseModel
from typing import Optional, Type, Any


class TeacherJSON(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[list[dict[str, Any]]]


class TeacherStructured(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[str]


class TeacherTimetableURL(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[str]


class TeacherAnswer(BaseModel):
    success: bool
    code: str
    message: str
    data: Optional[str]
