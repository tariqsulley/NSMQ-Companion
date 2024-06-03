from fastapi import APIRouter

router = APIRouter(
    prefix="/system",
    tags=["system"],
)


@router.get("/health")
async def health_check():
    return {
        "name": "NSMQ Companion",
        "version": "0.0.1",
        "status": "available",
    }