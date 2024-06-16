from pydantic import BaseModel, UUID4
from typing import List

class PerformanceCreate(BaseModel):
    student_id: str
    topic: List[str]
    score: List[int]
    time_taken: List[int]

class PerformanceRead(BaseModel):
    id: int
    student_id: UUID4
    topic: str
    score: int
    time_taken: int

    class Config:
        orm_mode = True
        