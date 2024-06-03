from typing import Union
from pydantic import BaseModel, EmailStr, validator,UUID4

class VerifyToken(BaseModel):
    Token: str

    class Config:
        orm_model = True


class TokenData(BaseModel):
    username: Union[str, None] = None


class Token(BaseModel):
    access_token: str
    token_type: str

    class Config:
        orm_model = True
