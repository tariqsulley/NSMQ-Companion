import uuid
import secrets
import uuid
from typing import Any, List, Union

from fastapi import Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import ORJSONResponse

from app.client.s3_client import S3Client
from app.core.logger import get_logger
from app.core.settings import settings
from app.utils.enums import  FileFormat
from app.core.constants import ADMIN_USER_ROLE, CUSTOMER_USER_ROLE
from app.core.security import JWTBearer

log = get_logger()

allow_admins_only = Depends(
    JWTBearer(
        allowed_roles=[
            ADMIN_USER_ROLE,
        ]
    )
)

allow_customers_only = Depends(
    JWTBearer(
        allowed_roles=[
            CUSTOMER_USER_ROLE,
        ]
    )
)

allow_admins_and_customers = Depends(
    JWTBearer(
        allowed_roles=[
            ADMIN_USER_ROLE,
            CUSTOMER_USER_ROLE,
        ]
    )
)

def generate_uuid() -> str:
    return str(uuid.uuid4())

def send_data(data: Any, status_code: int = 200):
    return ORJSONResponse(
        status_code=status_code,
        content={
            "data": jsonable_encoder(data),
        },
    )

def days_to_minutes(days):
    return days * 24 * 60

def send_data_with_info(data: Any, info: str, status_code: int = 200):
    log.info(info)
    return ORJSONResponse(
        status_code=status_code,
        content={
            "info": info,
            "data": data,
        },
    )

def send_info(info: str, status_code: int = 200):
    log.info(info)
    return ORJSONResponse(
        status_code=status_code,
        content={
            "info": info,
        },
    )

def send_client_side_error(user_msg: str, dev_msg: str = None, status_code: int = 400):
    log.error(user_msg, extra={"error": dev_msg})
    return ORJSONResponse(
        status_code=status_code,
        content={
            "userMsg": user_msg,
            "devMsg": user_msg if dev_msg is None else dev_msg,
        },
    )


def send_internal_server_error(user_msg: str, error: Any, status_code: int = 500):
    log.error(user_msg, extra={"error": error})
    return ORJSONResponse(
        status_code=status_code,
        content={
            "userMsg": user_msg,
            "devMsg": str(error),
        },
    )


def generate_unique_token(size: int):
    return secrets.token_hex(size).upper()


def get_content_type(file_format: FileFormat) -> str:
    content_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "pdf": "application/pdf",
    }
    content_type = content_types.get(file_format.value)
    return content_type


async def upload_to_s3(file_name: str, file_content: bytes, content_type: str) -> str:
    s3_client = S3Client(
        aws_access_key=settings.AWS_ACCESS_KEY_ID,
        aws_secret_key=settings.AWS_SECRET_ACCESS_KEY,
        bucket_name=settings.S3_BUCKET,
    )
    return await s3_client.upload_file(file_name, file_content, content_type)
