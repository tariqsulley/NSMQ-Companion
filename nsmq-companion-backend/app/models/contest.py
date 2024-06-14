from sqlalchemy import Column, Integer, String, ForeignKey,Float, Boolean,UUID
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel


class Year(BaseModel):
    __tablename__ = 'years'

    id = Column(Integer, primary_key=True)
    year = Column(Integer, unique=True)
    contests = relationship('Contest', backref='year')

class Contest(BaseModel):
    __tablename__ = 'contests'

    id = Column(Integer, primary_key=True)
    contest_name = Column(String)
    year_id = Column(Integer, ForeignKey('years.id'))
    rounds = relationship('Round', backref='contest')

class Round(BaseModel):
    __tablename__ = 'rounds'

    id = Column(Integer, primary_key=True)
    round_number = Column(Integer)
    contest_id = Column(Integer, ForeignKey('contests.id'))
    student_round_data = relationship('StudentRoundData', backref='round')


class StudentRoundData(BaseModel):
    __tablename__ = 'student_round_data'

    id = Column(Integer, primary_key=True)
    student_uuid = Column(UUID(as_uuid=True), ForeignKey('students.uuid'))
    round_id = Column(Integer, ForeignKey('rounds.id')) 
    contest_id = Column(String)
    year = Column(Integer)
    round_score = Column(Integer)
    maths = Column(Integer)
    biology = Column(Integer)
    chemistry = Column(Integer)
    physics = Column(Integer)


class QuestionData(BaseModel):
    __tablename__ = 'question_data'

    id = Column(Integer, primary_key=True)
    question_index = Column(Integer)
    topic = Column(String)
    correct_answer = Column(String)
    student_answer = Column(String)
    time_taken = Column(Float)
    is_correct = Column(Boolean)
    student_round_data_id = Column(Integer, ForeignKey('student_round_data.id'))