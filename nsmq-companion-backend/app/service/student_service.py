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
