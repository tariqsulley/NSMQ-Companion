from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse
from pydantic import EmailStr

from app.core import messages
from app.core.container import Container
from app.core.dependencies import get_current_user
from app.core.exceptions import ExpiredVerificationCodeError, NotFoundError
from app.core.security import extract_user_data
from app.core.settings import settings
from app.models.facilitator import Facilitator
from app.models.student import Student
from app.core.dependencies import get_current_user

from app.schemas.student import (
   StudentCreate,
   StudentBase,
   UpdateUserAvatar
)
from app.schemas.facilitator import(
    Facilitator
)

from app.service.user_service import UserService
from app.service.student_service import StudentService
from app.utils.utils import (
    send_client_side_error,
    send_data,
    send_info,
    send_internal_server_error,
)

router = APIRouter(
    prefix="/users",
    tags=["users"],
)
msg_prefix = "user"


@router.post("/facilitator", response_class=ORJSONResponse)
@inject
async def create_facilitator_handler(
    payload: Facilitator,
    service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        found_user = service.get_user_by_email_address(payload.email_address)
        if found_user:
            return send_client_side_error(
                user_msg=f"User already exists: {payload.email_address}",
            )

        user = service.create_user(payload)
        return send_data(user)
    except Exception as e:
        msg = "Failed to create facilitator"
        return send_internal_server_error(user_msg=msg, error=e)
    

@router.get("/", response_model=None)
@inject
async def get_users_handler(
     service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        facilitators = service.get_all_users()
        return send_data(facilitators)
    except Exception as e:
        msg = "Failed to retrieve facilitators"
        return send_internal_server_error(user_msg=msg, error=e)

@router.get("/{email_address}", response_model=Facilitator)
@inject
async def get_user_by_email(
    email_address: str,
     service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        user = service.get_user_by_email_address(email_address)
        if user is None:
            return send_client_side_error(
                user_msg=f"User not found with email: {email_address}"
            )
        return send_data(user)
    except Exception as e:
        msg = f"Failed to retrieve user with email: {email_address}"
        return send_internal_server_error(user_msg=msg, error=e)


@router.post("/create", response_model=StudentBase)
@inject
async def create_student_handler(
    student: StudentCreate,
     service: StudentService = Depends(Provide[Container.student_service]),
):
    try:
        created_student = service.create_student(student)
        return send_data(created_student)
    except Exception as e:
        msg = "Failed to create student"
        return send_internal_server_error(user_msg=msg, error=e)


@router.get("/{user_uuid}/find", response_model=Facilitator)
@inject
async def get_user_by_uuid(
    user_uuid: str,
     service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        user = service.get_user_by_uuid(user_uuid)
        if user is None:
            return send_client_side_error(
                user_msg=f"User not found with UUID: {user_uuid}"
            )
        return send_data(user)
    except Exception as e:
        msg = f"Failed to retrieve user with UUID: {user_uuid}"
        return send_internal_server_error(user_msg=msg, error=e)
    

@router.get("/students/{facilitator_uuid}",response_model=None)
@inject
async def get_students_for_facilitator(facilitator_uuid:str,
                                       service:StudentService = Depends(Provide[Container.student_service])):
    try:
        student = service.get_facilitator(facilitator_uuid)
        if student is None:
            return send_client_side_error(
                user_msg=f"Facilitator not found: {facilitator_uuid}"
            )
        return send_data(student)
    except Exception as e:
        msg = f"Failed to retrieve facilitator: {facilitator_uuid}"
        return send_internal_server_error(user_msg=msg,error=e)
    

@router.put("/avatar/facilitator/{uuid}", response_class=ORJSONResponse)
@inject
async def update_user_avatar_handler(
    uuid: str,
    payload: UpdateUserAvatar,
   service: UserService = Depends(Provide[Container.user_service])
):
    try:
        user = service.update_user_avatar(user_id=uuid, avatar_url=payload.avatar_url)
        return send_data(UpdateUserAvatar(avatar_url=user.avatar_url))
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)
    

@router.put("/avatar/student/{uuid}", response_class=ORJSONResponse)
@inject
async def update_user_avatar_handler(
    uuid: str,
    payload: UpdateUserAvatar,
    service:StudentService = Depends(Provide[Container.student_service])
):
    try:
        user = service.update_user_avatar(user_id=uuid, avatar_url=payload.avatar_url)
        return send_data(UpdateUserAvatar(avatar_url=user.avatar_url))
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)
    
