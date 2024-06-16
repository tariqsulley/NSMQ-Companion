from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from app.schemas.student import StudentProgressCreate, StudentProgressRead
from app.service.student_progress_service import StudentProgressService
from app.core.container import Container
from app.utils.utils import send_data, send_internal_server_error
from typing import List

router = APIRouter(
    prefix="/progress",
    tags=["progress"],
)

@router.post("/", response_class=ORJSONResponse)
@inject
async def create_student_progress(progress: StudentProgressCreate, 
                                  progress_service: StudentProgressService = Depends(Provide[Container.student_progress_service])):
    try:
        new_progress = progress_service.create_student_progress(progress)
        return send_data(new_progress)
    except Exception as e:
        return send_internal_server_error(user_msg="Error posting data", error=str(e))

@router.get("/{student_id}/{year}/{school}", response_model=List[StudentProgressRead])
@inject
async def get_student_progress(student_id: str, year: int, school: str, 
                               progress_service: StudentProgressService = Depends(Provide[Container.student_progress_service])):
    try:
        progress_list = progress_service.get_student_progress(student_id, year, school)
        return progress_list
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve progress data", error=str(e))

@router.get("/{student_id}", response_model=List[StudentProgressRead])
@inject
async def get_student_all_progress(student_id: str, 
                                   progress_service: StudentProgressService = Depends(Provide[Container.student_progress_service])):
    try:
        progress_list = progress_service.get_all_student_progress(student_id)
        return progress_list
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve all progress data", error=str(e))
    
@router.put("/{progress_id}", response_model=StudentProgressRead)
@inject
async def update_student_progress(progress_id: int, score: int, 
                                  progress_service: StudentProgressService = Depends(Provide[Container.student_progress_service])):
    try:
        updated_progress = progress_service.update_student_progress(progress_id, score)
        return updated_progress
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to update progress data", error=str(e))
