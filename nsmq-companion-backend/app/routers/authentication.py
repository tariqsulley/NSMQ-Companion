from fastapi import APIRouter,BackgroundTasks,Depends,Request,status
from fastapi.responses import ORJSONResponse

router= APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# @router.post("/login",response_class=ORJSONResponse)
