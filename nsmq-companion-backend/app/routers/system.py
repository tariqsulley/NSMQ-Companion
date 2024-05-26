from fastapi import APIRouter, Depends

from app.database import schemas
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/system",
    tags=["system"],
)


@router.get("/health")
async def health_check(get_current_user: schemas.Facilitator = Depends(get_current_user)):
    return {
        "name": "NSMQ Companion",
        "version": "0.0.1",
        "status": "available",
    }