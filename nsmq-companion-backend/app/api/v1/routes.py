from fastapi import APIRouter

from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.authentication import router as auth_router

routers = APIRouter()
router_list = [
    users_router,
    auth_router
]

for router in router_list:
    routers.include_router(router)