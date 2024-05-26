import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.model.base_model import Base


class PasswordReset(Base):
    __tablename__ = "password_reset_tokens"
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
    password_token = Column(String(450))
    expiry_date = Column(DateTime, nullable=False)
    user = relationship("User")