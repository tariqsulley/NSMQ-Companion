from pydantic import BaseModel


class AudioBytes(BaseModel):
    data: str 
    filename: str
