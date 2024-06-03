import uuid
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel


class Student(BaseModel):
    __tablename__ = "students"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    first_name = Column(String(length=30), nullable=False)
    last_name = Column(String(length=30), nullable=False)
    year = Column(Integer, nullable=False)
    email_address = Column(String(length=100), unique=True, nullable=False)
    password = Column(String(length=200), nullable=False)
    account_type = Column(String(length=200), nullable=False)
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey('Facilitators.uuid'))
    facilitator = relationship("Facilitator", back_populates="students")
    waiting_room_entry = relationship("WaitingRoom", back_populates="student", uselist=False, cascade="all, delete-orphan")





