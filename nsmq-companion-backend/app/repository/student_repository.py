from datetime import datetime, timedelta
from contextlib import AbstractContextManager
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Callable
from app.database.helpers import get_all_items
from app.utils.email import send_email
from app.utils.hashing import VERIFY_TOKEN_EXPIRE_DAYS, hash_user_password
from app.core.security import hash_user_password, verify_password
from app.core.settings import settings
from app.models.facilitator import Facilitator
from app.repository.base_repository import BaseRepository
from sqlalchemy.dialects.postgresql import UUID
from app.models.facilitator import Facilitator
from app.models.student import Student
from app.models.email_verification import EmailVerification
from app.schemas.email_verification import UserEmailVerification
from app.schemas.student import StudentCreate
import logging



class StudentRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory
        super().__init__(session_factory, Student)

    def create_student(self, student_data: StudentCreate):
        with self.session_factory() as session:
            hashed_password = hash_user_password("password")
            try:
                new_student = self.model(
                    first_name=student_data.first_name,
                    last_name=student_data.last_name,
                    year=student_data.year,
                    email_address=student_data.email_address,
                    password=hashed_password,
                    account_type="student",
                    facilitator_uuid=student_data.facilitator_uuid,
                )
                session.add(new_student) 
                session.commit() 
                session.refresh(new_student) 
                return new_student
            except Exception as e:
                logging.error(f"Failed to create student: {e}")
                raise HTTPException(status_code=400, detail=str(e))
            

    def get_students_by_facilitator_uuid(self,uuid:str):
        with self.session_factory() as session:
            try:
                return (session.query(self.model).filter(self.model.facilitator_uuid == uuid).all())
            except Exception as e:
                logging.error(f"Failed to find facilitator: {e}")
                raise HTTPException(status_code=404, detail=str(e))
            