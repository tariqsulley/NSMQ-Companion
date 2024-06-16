from sqlalchemy import Column, Integer, String, ForeignKey,UUID

from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel

class Performance(BaseModel):
    __tablename__ = "performance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.uuid"))
    topic = Column(String, index=True)
    score = Column(Integer)
    time_taken = Column(Integer)
    student = relationship("Student", back_populates="performances")