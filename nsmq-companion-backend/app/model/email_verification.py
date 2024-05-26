import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.model.base_model import Base


class EmailVerification(Base):
    __tablename__ = "email_verifications"
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_uuid = Column(
        UUID(as_uuid=True),
        ForeignKey("users.uuid"),
        primary_key=True,
        unique=True,
        nullable=False,
    )
    verification_token = Column(String(450))
    expiry_date = Column(String(450), nullable=False)
    user = relationship("User", back_populates="user_verification", lazy="subquery")