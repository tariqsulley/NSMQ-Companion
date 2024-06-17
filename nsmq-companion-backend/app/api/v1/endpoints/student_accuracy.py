from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from app.core.container import Container
from app.schemas.student_accuracy import  StudentAccuracy
from app.service.student_accuracy_service import StudentAccuracyService
from app.utils.utils import send_data, send_internal_server_error

router = APIRouter(
    prefix="/accuracies",
    tags=["accuracies"]
)

@router.post("/", response_class=ORJSONResponse)
@inject
async def update_accuracies(
    accuracy_data: StudentAccuracy, 
    accuracy_service: StudentAccuracyService = Depends(Provide[Container.student_accuracy_service])
):
    try:
        updated_accuracy = accuracy_service.update_accuracies(
            student_id=accuracy_data.student_id, 
            year=accuracy_data.year, 
            contest_id=accuracy_data.contest_id, 
            accuracies=accuracy_data.accuracies
        )
        return send_data(updated_accuracy)
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to update accuracies", error=str(e))

@router.get("/{student_id}/{year}/{contest_id}", response_class=ORJSONResponse)
@inject
async def get_accuracies(
    student_id: str, 
    year: int, 
    contest_id: str, 
    accuracy_service: StudentAccuracyService = Depends(Provide[Container.student_accuracy_service])
):
    try:
        accuracies = accuracy_service.fetch_accuracies(student_id, year, contest_id)
        if not accuracies:
            raise HTTPException(status_code=404, detail="Accuracies not found")
        return send_data(accuracies)
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve accuracies", error=str(e))
