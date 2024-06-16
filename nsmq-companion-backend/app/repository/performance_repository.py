from contextlib import AbstractContextManager
from sqlalchemy.orm import Session
from typing import Callable
from fastapi import HTTPException
import logging

from app.models.perfomance_model import Performance
from app.schemas.performance import PerformanceCreate
from app.repository.base_repository import BaseRepository
from app.models.student import Student 
from typing import List


class PerformanceRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory
        super().__init__(session_factory, Performance)

    def create_performance(self, performance_data: PerformanceCreate):
        with self.session_factory() as session:
            try:
                performance_entries = []
                for topic, score, time in zip(performance_data.topic, performance_data.score, performance_data.time_taken):
                    performance_entries.append(Performance(
                        student_id=performance_data.student_id,
                        topic=topic,
                        score=score,
                        time_taken=time,
                    ))
                session.add_all(performance_entries)
                session.commit()
                for entry in performance_entries:
                    session.refresh(entry)
                return performance_entries
            except Exception as e:
                logging.error(f"Failed to create performance: {e}")
                raise HTTPException(status_code=400, detail=str(e))

    def get_performance_by_student(self, student_id: str):
        with self.session_factory() as session:
            try:
                return session.query(Performance).filter(Performance.student_id == student_id).all()
            except Exception as e:
                logging.error(f"Failed to find performance for student {student_id}: {e}")
                raise HTTPException(status_code=404, detail=str(e))

    def get_performance_by_contest(self, contest_id: str):
        with self.session_factory() as session:
            try:
                return session.query(Performance).filter(Performance.contest_id == contest_id).all()
            except Exception as e:
                logging.error(f"Failed to find performance for contest {contest_id}: {e}")
                raise HTTPException(status_code=404, detail=str(e))

    def get_all_performance(self):
        with self.session_factory() as session:
            try:
                return session.query(Performance).all()
            except Exception as e:
                logging.error(f"Failed to retrieve all performance data: {e}")
                raise HTTPException(status_code=500, detail=str(e))
            
    def get_student_names(self, student_ids: List[str]):
        with self.session_factory() as session:
            try:
                students = session.query(Student).filter(Student.uuid.in_(student_ids)).all()
                return {str(student.uuid): f"{student.first_name} {student.last_name}" for student in students}
            except Exception as e:
                logging.error(f"Failed to retrieve student names: {e}")
                raise HTTPException(status_code=500, detail=str(e))
