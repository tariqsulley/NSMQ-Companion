from fastapi import APIRouter

from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.authentication import router as auth_router
from app.api.v1.endpoints.language import router as language_router
from app.api.v1.endpoints.multiplayer import router as multiplayer_router
from app.api.v1.endpoints.questions import router as questions_router
routers = APIRouter()
router_list = [
    users_router,
    auth_router,
    language_router,
    multiplayer_router,
    questions_router
]

for router in router_list:
    routers.include_router(router)