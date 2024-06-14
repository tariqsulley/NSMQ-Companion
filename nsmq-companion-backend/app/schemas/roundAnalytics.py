from pydantic import BaseModel

class Round1AnalyticsData(BaseModel):
    student_id: int
    contest_id: int
    round_score: int
    subject_scores: dict
    