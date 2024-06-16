from contextlib import AbstractContextManager
from sqlalchemy.orm import Session
from typing import Callable, List
from fastapi import HTTPException
import logging

from app.models.student import StudentProgress
from app.schemas.student import StudentProgressCreate
from app.repository.base_repository import BaseRepository

class StudentProgressRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory
        super().__init__(session_factory, StudentProgress)

    def create_student_progress(self, progress_data: StudentProgressCreate):
        with self.session_factory() as session:
            try:
                progress_entry = StudentProgress(**progress_data.dict())
                session.add(progress_entry)
                session.commit()
                session.refresh(progress_entry)
                return progress_entry
            except Exception as e:
                logging.error(f"Failed to create student progress: {e}")
                raise HTTPException(status_code=400, detail=str(e))

    def get_student_progress(self, student_id: str, year: int, school: str):
        with self.session_factory() as session:
            try:
                return session.query(StudentProgress).filter(
                    StudentProgress.student_id == student_id,
                    StudentProgress.year == year,
                    StudentProgress.school == school
                ).all()
            except Exception as e:
                logging.error(f"Failed to retrieve progress for student {student_id}: {e}")
                raise HTTPException(status_code=404, detail=str(e))
            
    def get_all_student_progress(self, student_id: str):
        with self.session_factory() as session:
            try:
                progress_list = session.query(StudentProgress).filter(
                    StudentProgress.student_id == student_id
                ).all()
                for progress in progress_list:
                    progress.student_id = str(progress.student_id)
                return progress_list
            except Exception as e:
                logging.error(f"Failed to retrieve all progress for student {student_id}: {e}")
                raise HTTPException(status_code=404, detail=str(e))
            
    def update_student_progress(self, progress_id: int, score: int):
        with self.session_factory() as session:
            try:
                progress = session.query(StudentProgress).filter(StudentProgress.id == progress_id).first()
                if progress:
                    progress.completed = True
                    progress.score = score
                    session.commit()
                    session.refresh(progress)
                    return progress
                else:
                    raise HTTPException(status_code=404, detail="Progress not found")
            except Exception as e:
                logging.error(f"Failed to update progress {progress_id}: {e}")
                raise HTTPException(status_code=400, detail=str(e))
