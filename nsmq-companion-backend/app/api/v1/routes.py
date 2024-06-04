from fastapi import APIRouter

from app.api.v1.endpoints.users import router as users_router

routers = APIRouter()
router_list = [
    users_router,
]

for router in router_list:
    routers.include_router(router)