import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    first_name = Column(String(length=30), nullable=False)
    last_name = Column(String(length=30), nullable=False)
    email_address = Column(String(length=100), unique=True, nullable=False)
    password = Column(String(length=200), nullable=True)
    account_type = Column(String(length=50), nullable=False)
    school = Column(String(length=200), nullable=True)
    year = Column(Integer, nullable=True)
    verifiedAt = Column(String(length=100), nullable=True, default=None, index=True)

    # Add a foreign key to link a student to a facilitator
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey('users.uuid'), nullable=True)

    # Define the self-referential relationship
    facilitator = relationship('User', remote_side=[uuid], post_update=True)

    # Define a relationship to get the students associated with a facilitator
    students = relationship('User', remote_side=[facilitator_uuid], post_update=True)