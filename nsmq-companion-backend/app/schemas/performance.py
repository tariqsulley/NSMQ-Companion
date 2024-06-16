from pydantic import BaseModel, UUID4
from typing import List

class PerformanceCreate(BaseModel):
    student_id: str
    topic: List[str]
    score: List[int]
    time_taken: List[int]
