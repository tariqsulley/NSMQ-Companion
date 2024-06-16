from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from app.schemas.performance import PerformanceCreate
from app.service.performance_service import PerformanceService
from app.core.container import Container
from app.utils.utils import send_data, send_internal_server_error

router = APIRouter(
    prefix="/performance",
    tags=["performance"],
)

@router.post("/", response_class=ORJSONResponse)
@inject
async def create_performance(performance: PerformanceCreate, 
                             performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        new_performance = performance_service.create_performance(performance)
        return send_data(new_performance)
    except Exception as e:
        return send_internal_server_error(user_msg="Error posting data", error=str(e))

@router.get("/student/{student_id}", response_model=list[PerformanceCreate])
@inject
async def get_performance_by_student(student_id: int, 
                                     performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        performance_list = performance_service.get_performance_by_student(student_id)
        return performance_list
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve performance data", error=str(e))

@router.get("/contest/{contest_id}", response_model=list[PerformanceCreate])
@inject
async def get_performance_by_contest(contest_id: str, 
                                     performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        performance_list = performance_service.get_performance_by_contest(contest_id)
        return performance_list
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve performance data", error=str(e))
