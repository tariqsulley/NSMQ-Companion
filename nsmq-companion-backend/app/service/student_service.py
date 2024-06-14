from datetime import datetime, timedelta
from uuid import UUID

from pydantic import EmailStr

from app.core import messages
from app.core.exceptions import NotFoundError

from app.repository.user_repository import UserRepository
from app.repository.student_repository import StudentRepository
from app.service.base_service import BaseService
from app.schemas.facilitator import Facilitator
from app.schemas.student import StudentCreate


class StudentService(BaseService):
    def __init__(
        self,
        student_repository: StudentRepository,
    ):
        self.student_repository = student_repository
        super().__init__(student_repository)
 
    def create_student(self,payload:StudentCreate):
        return self.student_repository.create_student(payload)
    
    def get_facilitator(self,payload:str):
        return self.student_repository.get_students_by_facilitator_uuid(payload)
    
    def get_student_by_uuid(self,student_uuid:str):
        return self.student_repository.get_student_by_uuid(student_uuid)
    
    def update_user_avatar(self, user_id: str, avatar_url: str):
        try:
            return self.student_repository.update_user_avatar(user_id, avatar_url)
        except Exception as e:
            raise e
        
    def update_student_round_data(self, student_uuid: str, year:int, round_score: int, round_id:int, contest_id: str, maths_score: int, 
                                  biology_score: int, chemistry_score: int, physics_score: int):
        return self.student_repository.update_student_round_data(student_uuid, year, round_score, round_id, contest_id, 
                                                                 maths_score, biology_score, chemistry_score, 
                                                                 physics_score)

    def get_student_rounds(self, student_uuid: UUID, year: int, contest_id: str):
        return self.student_repository.get_student_rounds(student_uuid, year, contest_id)

    async def get_contest_rounds_scores(self, student_uuid: UUID, year: int):
        return await self.student_repository.get_contest_rounds_scores(student_uuid, year)
