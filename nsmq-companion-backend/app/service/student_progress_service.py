from app.repository.student_progress_repository import StudentProgressRepository
from app.schemas.student import StudentProgressCreate
from app.service.base_service import BaseService
from typing import List

class StudentProgressService(BaseService):
    def __init__(
        self,
        student_progress_repository: StudentProgressRepository
    ):
        self.student_progress_repository = student_progress_repository
        super().__init__(student_progress_repository)

    def create_student_progress(self, progress_data: StudentProgressCreate):
        return self.student_progress_repository.create_student_progress(progress_data)

    def get_student_progress(self, student_id: str, year: int, school: str):
        return self.student_progress_repository.get_student_progress(student_id, year, school)

    def get_all_student_progress(self, student_id: str):
        return self.student_progress_repository.get_all_student_progress(student_id)

    def update_student_progress(self, progress_id: int, score: int):
        return self.student_progress_repository.update_student_progress(progress_id, score)
