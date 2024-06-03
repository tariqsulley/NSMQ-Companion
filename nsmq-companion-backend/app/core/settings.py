import os
from functools import lru_cache
from typing import Dict, List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

ENV: str = "test"

class Settings(BaseSettings):
    PROJECT_NAME: str = "NSMQ Companion"
    API_VERSION: str = os.getenv("API_VERSION", "0.0.1")
    ENV: str = os.getenv("ENV", ENV)
    API: str = "/api"
    API_V1_STR: str = "/api/v1"

    # date
    DATETIME_FORMAT: str = "%Y-%m-%dT%H:%M:%S"
    DATE_FORMAT: str = "%Y-%m-%d"

    # auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "test_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = (
        60 * 24 * 7
    )  # 60 minutes * 24 hours * 7 days = 7 days
    AUTH_ALGORITHM: str = os.getenv("AUTH_ALGORITHM", "HS256")
    VERIFY_TOKEN_EXPIRE_DAYS: int = os.getenv("VERIFY_TOKEN_EXPIRE_DAYS", 3)
    PASSWORD_RESET_TOKEN_EXPIRE_DAYS: int = os.getenv(
        "PASSWORD_RESET_TOKEN_EXPIRE_DAYS", 3
    )

    # database
    DB_USER: str = os.getenv("DB_USER", "mvi_tracking_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "mvi_tracking_pass")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "mvi_tracking_db")
    DB_ENGINE: str = os.getenv("DB", "postgresql")

    DATABASE_URI: str = (
        "{db_engine}://{user}:{password}@{host}:{port}/{database}".format(
            db_engine=DB_ENGINE,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
        )
    )

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # email
    MAIL_VERIFICATION_MESSAGE: str = os.getenv(
        "MAIL_VERIFICATION_MESSAGE",
        "Please use the button link below to verify your account and get started with the NSMQ Companion App.",
    )

    VERIFY_EMAIL_URL: str = os.getenv(
        "VERIFY_EMAIL_URL",
        "(I will add the frontend link here soon)",
    )

    RESET_PASSWORD_URL: str = os.getenv(
        "RESET_PASSWORD_URL",
        "(I will add the frontend link here soon)",
    )

    RESET_BTN: str = os.getenv("RESET_BTN", "Reset Password")
    VERIFY_BTN: str = os.getenv("VERIFY_BTN", "Verify Email")

    PASSWORD_RESET_MAIL_VERIFICATION_MESSAGE: str = os.getenv(
        "PASSWORD_RESET_MAIL_VERIFICATION_MESSAGE",
        "Please use the button link below to reset your password",
    )

    # aws
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "aws_access_key_id")
    AWS_SECRET_ACCESS_KEY: str = os.getenv(
        "AWS_SECRET_ACCESS_KEY", "aws_secret_access_key"
    )
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-2")


    # echo parrot
    ECHO_PARROT_HOST: str = os.getenv("ECHO_PARROT_HOST", "localhost")
    ECHO_PARROT_PORT: int = os.getenv("ECHO_PARROT_PORT", 80)
    SMS_SENDER_ID: str = os.getenv("SMS_SENDER_ID", "MoneyBQ")
    SMS_SENDER_APP: str = os.getenv("SMS_SENDER_APP", "MVI")
    SENDER_EMAIL: str = os.getenv(
        "SENDER_EMAIL", "NSMQ Companion <info@nsmqcompanion.net>"
    )
    SENDER_NAME: str = os.getenv("SENDER_NAME", "NSMQ Companion")

    # find query
    PAGE: int = 1
    PAGE_SIZE: int = 20
    ORDERING: str = "-id"

    class Config:
        case_sensitive = True


settings = Settings()


class TestConfigs(Settings):
    ENV: str = "test"


if ENV == "production":
    pass
elif ENV == "staging":
    pass
elif ENV == "test":
    setting = TestConfigs()


@lru_cache
def get_settings():
    return settings