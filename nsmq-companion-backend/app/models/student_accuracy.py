from sqlalchemy import Column, Integer, String, Float, ForeignKey, UUID
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel

class StudentAccuracy(BaseModel):
    __tablename__ = "student_accuracies"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.uuid'), nullable=False)
    year = Column(Integer, nullable=False)
    contest_id = Column(String, nullable=False)
    maths_accuracy = Column(Float, default=0.0)
    biology_accuracy = Column(Float, default=0.0)
    chemistry_accuracy = Column(Float, default=0.0)
    physics_accuracy = Column(Float, default=0.0)
    rounds_played = Column(Integer, default=1)

    student = relationship("Student", back_populates="accuracies")
