# from sqlalchemy import Column, DateTime, ForeignKey
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from sqlalchemy.sql import func
# from app.models.base_model import BaseModel

# class WaitingRoom(BaseModel):
#     __tablename__ = "waiting_room"

#     student_uuid = Column(
#         UUID(as_uuid=True),
#         ForeignKey("students.uuid"),
#         primary_key=True,
#         unique=True,
#         nullable=False,
#     )
#     student = relationship("Student", back_populates="waiting_room_entry")
#     joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
