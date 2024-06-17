from pydantic import BaseModel
from typing import Optional,Dict

class StudentAccuracy(BaseModel):
    student_id: str
    year: int
    contest_id: str
    accuracies: Dict[str, float] 

   