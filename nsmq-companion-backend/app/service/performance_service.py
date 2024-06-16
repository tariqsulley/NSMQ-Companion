from app.repository.performance_repository import PerformanceRepository
from app.schemas.performance import PerformanceCreate
from app.service.base_service import BaseService

class PerformanceService(BaseService):
    def __init__(self, performance_repository: PerformanceRepository):
        self.performance_repository = performance_repository
        super().__init__(performance_repository)

    def create_performance(self, performance_data: PerformanceCreate):
        return self.performance_repository.create_performance(performance_data)

    def get_performance_by_student(self, student_id: int):
        return self.performance_repository.get_performance_by_student(student_id)

    def get_performance_by_contest(self, contest_id: str):
        return self.performance_repository.get_performance_by_contest(contest_id)
