from sqlalchemy.orm import Session
from app.models.student_accuracy import StudentAccuracy
from typing import List

class StudentAccuracyRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory

    def create_or_update_accuracy(self, student_id: str, year: int, contest_id: str, accuracies: dict):
        with self.session_factory() as session:
            existing_accuracy = session.query(StudentAccuracy).filter(
                StudentAccuracy.student_id == student_id,
                StudentAccuracy.year == year,
                StudentAccuracy.contest_id == contest_id
            ).first()

            if existing_accuracy:
                for subject, new_accuracy in accuracies.items():
                    current_accuracy = getattr(existing_accuracy, f"{subject.lower()}_accuracy", 0)
                    rounds_played = existing_accuracy.rounds_played
                    updated_accuracy = (current_accuracy * rounds_played + new_accuracy) / (rounds_played + 1)
                    setattr(existing_accuracy, f"{subject.lower()}_accuracy", updated_accuracy)
                existing_accuracy.rounds_played += 1
            else:
                new_accuracy = StudentAccuracy(
                    student_id=student_id,
                    year=year,
                    contest_id=contest_id,
                    maths_accuracy=accuracies.get("Maths", 0),
                    biology_accuracy=accuracies.get("Biology", 0),
                    chemistry_accuracy=accuracies.get("Chemistry", 0),
                    physics_accuracy=accuracies.get("Physics", 0),
                    rounds_played=1 
                )
                session.add(new_accuracy)

            session.commit()
