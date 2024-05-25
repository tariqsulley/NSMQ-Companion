from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse
from pydantic import EmailStr



router = APIRouter(
    prefix="/users",
    tags=["users"],
)
msg_prefix = "user"

