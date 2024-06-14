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
from app.models.contest import StudentRoundData


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
            
    def get_student_by_uuid(self, student_uuid: str):
        with self.session_factory() as session:
            student = (
            session.query(Student)
            .filter(Student.uuid == student_uuid)
            .first()
        )
        return student
    
    def update_user_avatar(self, user_id: str, avatar_url: str):
        with self.session_factory() as session:
            user = session.query(self.model).filter(self.model.uuid == user_id).first()
            user.avatar_url = avatar_url
            session.commit()
            session.refresh(user)
            return user
        
    def update_student_round_data(self, student_uuid: str, year: int, round_score: int, round_id: int,
                              contest_id: str, maths_score: int, biology_score: int,
                              chemistry_score: int, physics_score: int):
        with self.session_factory() as session:
            new_student_round = StudentRoundData(
            student_uuid=student_uuid,
            round_id=round_id,
            contest_id=contest_id,
            year=year,
            round_score=round_score,
            maths=maths_score,
            biology=biology_score,
            chemistry=chemistry_score,
            physics=physics_score
        )
        session.add(new_student_round)
        session.commit()
        session.refresh(new_student_round)
        return new_student_round
    
    def get_student_rounds(self, student_uuid: UUID, year: int, contest_id: str):
        with self.session_factory() as session:
            rounds = session.query(StudentRoundData).filter(
            StudentRoundData.student_uuid == student_uuid,
            StudentRoundData.year == year,
            StudentRoundData.contest_id == contest_id
        ).all()

        result = []
        for round in rounds:
            result.append({
                "name": f"Round {round.round_id}",
                "Maths": round.maths,
                "Biology": round.biology,
                "Chemistry": round.chemistry,
                "Physics": round.physics,
            })
        return result

    async def get_contest_rounds_scores(self, student_uuid: UUID, year: int):
        with self.session_factory() as session:
            try:
                # Adding a filter for the year
                round_data = session.query(StudentRoundData).filter(
                    StudentRoundData.student_uuid == student_uuid,
                    StudentRoundData.year == year  # Assumes that the 'year' column directly corresponds to the year of the contest
                ).order_by(StudentRoundData.contest_id, StudentRoundData.round_id).all()

                results = {}
                for data in round_data:
                    contest_key = f'Contest {data.contest_id}'
                    results.setdefault(contest_key, {})
                    results[contest_key][f'Round {data.round_id}'] = data.round_score

                formatted_results = [{'date': contest, **rounds} for contest, rounds in results.items()]
                return formatted_results
            except Exception as e:
                print(f"Error processing round data for {student_uuid} in {year}: {e}")
                raise




    
