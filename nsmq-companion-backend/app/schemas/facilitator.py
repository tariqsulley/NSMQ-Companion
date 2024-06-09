from pydantic import BaseModel,EmailStr


class Facilitator(BaseModel):
    first_name: str
    last_name: str
    school:str
    email_address: EmailStr
    account_type:str
    password: str

    class Config:
        orm_model = True
        
class UpdateUserAvatar(BaseModel):
    avatar_url: str