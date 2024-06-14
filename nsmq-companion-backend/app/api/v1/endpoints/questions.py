from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse
from app.core.container import Container
from app.schemas.roundData import RoundData
from fastapi import HTTPException
from app.service.student_service import StudentService
from app.utils.utils import (
    send_client_side_error,
    send_data,
    send_info,
    send_internal_server_error,
)


router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

msg_prefix = "user"

@router.post("/round-score", response_class=ORJSONResponse)
@inject
async def create_round_score(data: RoundData, 
                             student_service: StudentService = Depends(Provide[Container.student_service])):
    try:
        student = student_service.get_student_by_uuid(data.Student_uuid)
        if not student:
            raise HTTPException(status_code=404, detail=f"Student with UUID {data.Student_uuid} not found")

        new_round_data = student_service.update_student_round_data(
            student_uuid=data.Student_uuid,
            year=data.Year,
            round_score=data.Round_score,
            contest_id=data.Contest_id,
            round_id=data.Round_id,
            maths_score=data.Maths,
            biology_score=data.Biology,
            chemistry_score=data.Chemistry,
            physics_score=data.Physics
        )

        return send_data(new_round_data)

    except Exception as e:
        msg = "Error posting data"
        return send_internal_server_error(user_msg=msg, error=str(e))
    

@router.get("/student-rounds", response_model=None) 
@inject
async def get_student_rounds(
    student_uuid: str,
    year: int,
    contest_id: str,
    student_service: StudentService = Depends(Provide[Container.student_service])):
    try:
        rounds_data = student_service.get_student_rounds(student_uuid, year, contest_id)
        return rounds_data
    except Exception as e:
        return send_internal_server_error("Failed to retrieve round scores", str(e))

@router.get("/contest-rounds", response_model=None)
@inject
async def get_contest_rounds_scores(student_uuid: str ,
                                    student_service: StudentService = Depends(Provide[Container.student_service])):
    try:
        contest_rounds_data =  await student_service.get_contest_rounds_scores(student_uuid)
        return contest_rounds_data
    except Exception as e:
        print(f"Error: {str(e)}")  
        raise HTTPException(status_code=500, detail="Failed to retrieve contest round scores")
    

