from pydantic import BaseModel

class TeacherCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    school: str

class Token(BaseModel):
    access_token: str
    token_type: str
