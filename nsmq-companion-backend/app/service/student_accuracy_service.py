from app.repository.student_accuracy_repository import StudentAccuracyRepository
from app.service.base_service import BaseService
from typing import Dict,List

class StudentAccuracyService(BaseService):
    def __init__(
        self,
        student_accuracy_repository: StudentAccuracyRepository
    ):
        self.student_accuracy_repository= student_accuracy_repository
        super().__init__(student_accuracy_repository)

    def update_accuracies(self, student_id: str, year: int, contest_id: str, accuracies: dict):
        self.student_accuracy_repository.create_or_update_accuracy(student_id, year, contest_id, accuracies)

    def fetch_accuracies(self, student_id: str, year: int, contest_id: str):
        return self.student_accuracy_repository.get_accuracies(student_id, year, contest_id)
    
    def fetch_accuracies_by_student(self, student_id: str) -> Dict[str, List[int]]:
        return self.student_accuracy_repository.get_accuracies_by_student(student_id)
