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
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey('Facilitators.uuid'))
    facilitator = relationship("Facilitator", back_populates="students")
    # waiting_room_entry = relationship("WaitingRoom", back_populates="student", uselist=False, cascade="all, delete-orphan")
    waiting_room_data = relationship("WaitingRoomData", back_populates="student", cascade="all, delete-orphan")


class WaitingRoomData(BaseModel):
    __tablename__ = "waiting_room_data"

    id = Column(Integer, primary_key=True)
    student_uuid = Column(UUID(as_uuid=True), ForeignKey("students.uuid"), nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    connected = Column(Boolean, nullable=False, default=True)
    matched = Column(Boolean, nullable=False, default=False)
    opponent_uuid = Column(Text, nullable=True)

    student = relationship("Student", back_populates="waiting_room_data")