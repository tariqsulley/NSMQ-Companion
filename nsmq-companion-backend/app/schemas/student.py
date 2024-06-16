from pydantic import BaseModel, EmailStr, validator,UUID4

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    year: int
    email_address: EmailStr
    account_type:str

class StudentCreate(StudentBase):
    first_name: str
    last_name: str
    year: int
    email_address: EmailStr
    account_type:str
    facilitator_uuid: str


class Login(BaseModel):
    email_address: EmailStr
    account_type:str
    password: str

    class Config:
        orm_model = True

class UpdateUserAvatar(BaseModel):
    avatar_url: str


class StudentProgressBase(BaseModel):
    student_id: str
    year: int
    school: str
    round_number: int
    completed: bool
    score: int

class StudentProgressCreate(StudentProgressBase):
    student_id: str
    year: int
    school: str
    round_number: int
    completed: bool
    score: int

class StudentProgressRead(StudentProgressBase):
    id: int

    class Config:
        orm_mode = True


        







