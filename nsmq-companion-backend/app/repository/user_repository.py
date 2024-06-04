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
from app.models.email_verification import EmailVerification
from app.schemas.email_verification import UserEmailVerification
from app.schemas.student import StudentCreate
from app.models.student import Student
import logging


class UserRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory
        super().__init__(session_factory, Facilitator)
        
    def get_all_users(self):
        with self.session_factory() as session:
            try:
                return get_all_items(session, self.model)
            except Exception as e:
                logging.error(f"Error retrieving users: {e}")
                raise HTTPException(status_code=500, detail="Error retrieving users")
            
    
    # def get_user_by_email_address(self, email: str):
    #     with self.session_factory() as session:
    #         return (
    #             session.query(self.model)
    #             .filter(self.model.email_address == email)
    #             .first()
    #         )

    def get_user_by_email_address(self, email: str):
        with self.session_factory() as session:
            facilitator = (
                session.query(Facilitator)
                .filter(Facilitator.email_address == email)
                .first()
            )
            if facilitator:
                return facilitator

            student = (
                session.query(Student)
                .filter(Student.email_address == email)
                .first()
            )
            return student

    def create_user(self, user: Facilitator):
        with self.session_factory() as session:
            try:
                new_user = self.model(
                    first_name=user.first_name,
                    last_name=user.last_name,
                    school = user.school,
                    email_address=user.email_address,
                    account_type=user.account_type,
                    password=hash_user_password(user.password), 
                )
                session.add(new_user) 
                session.commit()      
                session.refresh(new_user) 
                return new_user
            except Exception as e:
                logging.error(f"Failed to create user: {e}")
                raise HTTPException(status_code=400, detail=str(e))

    def create_verification_token(
        self,
        user_verify: UserEmailVerification,
        verification_token: str
    ):
        with self.session_factory() as session:
            current_date = datetime.now()

            db_verify = EmailVerification(
                user_uuid=user_verify.uuid,
                verification_token=verification_token["verification_token"],
                expiry_date=current_date
                + timedelta(days=settings.VERIFY_TOKEN_EXPIRE_DAYS),
            )

            session.add(db_verify)
            session.commit()

            db_user = (
                session.query(self.model)
                .filter(self.model.uuid == user_verify.uuid)
                .first()
            )

            return db_user, verification_token["verification_token"]
        
        
    def get_students_by_facilitator_uuid(self, uuid: str):
        with self.session_factory() as session:
            try:
                students = session.query(self.model).filter(self.model.facilitator_uuid == uuid).all()
                return students
            except Exception as e:
                logging.error(f"Error retrieving students: {e}")
                raise HTTPException(status_code=500, detail="Failed to retrieve students")

    def get_user_by_uuid(self, user_uuid: str):
        with self.session_factory() as session:
            facilitator = (
            session.query(Facilitator)
            .filter(Facilitator.uuid == user_uuid)
            .first()
        )
        if facilitator:
            return facilitator

        student = (
            session.query(Student)
            .filter(Student.uuid == user_uuid)
            .first()
        )
        return student
    
    # def get_user_by_uuid(self, user_uuid: str):
    #     with self.session_factory() as session:
    #         user = session.query(self.model).filter(self.model.uuid == user_uuid).first()
    #         if not user:
    #             user = session.query(self.model).filter(self.model.uuid == user_uuid).first()
    #         if not user:
    #             logging.warning(f"No user found with UUID: {user_uuid}")
    #         return user

  

    def delete_student_by_uuid(self, facilitator_uuid: str, student_uuid: str) -> bool:
        with self.session_factory() as session:
            student = session.query(self.model).filter(
                self.model.uuid == student_uuid,
                self.model.facilitator_uuid == facilitator_uuid
            ).first()
            if not student:
                logging.warning(f"No student found with UUID: {student_uuid}")
                return False
            session.delete(student)
            session.commit()
            return True
    
    def change_password(
        self,
        user_uuid: str,
        old_password: str,
        new_password: str,
        password_confirmation: str,
    ):
        with self.session_factory() as session:
            user = (
                session.query(self.model).filter(self.model.uuid == user_uuid).first()
            )
            # Check if the user exists
            if not user:
                raise Exception("User not found")

            # check if new password and confirm password match
            if not new_password == password_confirmation:
                raise Exception("New password and confirm password does not match")

            # Compare the old password with the stored hashed password
            if not verify_password(old_password, user.password):
                raise Exception("Incorrect old password provided")

            if verify_password(new_password, user.password):
                raise Exception("New password and old password cannot be the same")

            # Update the password with the new hashed password
            user.password = hash_user_password(new_password)

            # Commit the changes to the database
            session.commit()
            session.refresh(user)

            return user
        
    
    def update_user_avatar(self, user_id: str, avatar_url: str):
        with self.session_factory() as session:
            user = session.query(self.model).filter(self.model.uuid == user_id).first()
            user.avatar_url = avatar_url
            session.commit()
            session.refresh(user)
            return user
        
 
        


