from pydantic import BaseModel

class SimilarityRequest(BaseModel):
    question_answer: str
    student_answer: str

class SimilarityResponse(BaseModel):
    similarity: float

