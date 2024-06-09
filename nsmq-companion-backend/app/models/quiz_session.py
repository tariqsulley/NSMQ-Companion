from sqlalchemy import Column, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base_model import BaseModel

class QuizSession(BaseModel):
    __tablename__ = "quiz_session"

    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        unique=True,
        nullable=False
    )
    player1_uuid = Column(
        UUID(as_uuid=True),
        ForeignKey("students.uuid"),
        nullable=False
    )
    player2_uuid = Column(
        UUID(as_uuid=True),
        ForeignKey("students.uuid"),
        nullable=False
    )