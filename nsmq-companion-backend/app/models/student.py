import uuid
from sqlalchemy import Column, ForeignKey, Integer, String, ForeignKey,DateTime,Boolean,Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel
from sqlalchemy.sql import func


class Student(BaseModel):
    __tablename__ = "students"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    first_name = Column(String(length=30), nullable=False)
    last_name = Column(String(length=30), nullable=False)
    year = Column(Integer, nullable=False)
    email_address = Column(String(length=100), unique=True, nullable=False)
    password = Column(String(length=200), nullable=True)
    account_type = Column(String(length=200), nullable=False)
    avatar_url = Column(String(length=200), nullable=True)
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey('Facilitators.uuid'))
    facilitator = relationship("Facilitator", back_populates="students")
    performances = relationship("Performance", back_populates="student", cascade="all, delete-orphan")
    waiting_room_data = relationship("WaitingRoomData", back_populates="student", cascade="all, delete-orphan")
    progress = relationship("StudentProgress", back_populates="student")


class StudentProgress(BaseModel):
    __tablename__ = 'student_progress'
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey('students.uuid'))
    year = Column(Integer)
    school = Column(String)
    round_number = Column(Integer)
    completed = Column(Boolean, default=False)
    score = Column(Integer)
    student = relationship("Student", back_populates="progress")

class WaitingRoomData(BaseModel):
    __tablename__ = "waiting_room_data"

    id = Column(Integer, primary_key=True)
    student_uuid = Column(UUID(as_uuid=True), ForeignKey("students.uuid"), nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    connected = Column(Boolean, nullable=False, default=True)
    matched = Column(Boolean, nullable=False, default=False)
    opponent_uuid = Column(Text, nullable=True)

    student = relationship("Student", back_populates="waiting_room_data")