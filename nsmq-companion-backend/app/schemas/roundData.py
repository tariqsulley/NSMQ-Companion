from pydantic import BaseModel
 
class RoundData(BaseModel):
    Student_uuid:str
    Year:int
    Contest_id:str
    Round_id:int
    Round_score: int
    Maths: int
    Biology:int
    Chemistry:int
    Physics: int
   