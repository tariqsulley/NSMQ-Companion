import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base_model import BaseModel
from app.models.student import Student

class EmailVerification(BaseModel):
    __tablename__ = "email_verifications"
    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4)
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey("Facilitators.uuid"), unique=True, nullable=False)
    verification_token = Column(String(450))
    expiry_date = Column(String(450), nullable=False)
    facilitator = relationship("Facilitator", back_populates="facilitator_verification")