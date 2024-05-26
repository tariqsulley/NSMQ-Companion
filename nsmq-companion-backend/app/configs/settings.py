import os
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "Dragovic12!"
    DB_HOST: str = "nsmq-companion-database.cb2gw6s82ebd.eu-north-1.rds.amazonaws.com"
    DB_PORT: str = "5432"
    DB_NAME: str = "nsmqcompaniondb"

    class Config:
        env_file = ".env"


settings = Settings()


class SharedSettings(BaseSettings):
    app_name: str = "NSMQ Companion"
    app_version: str = "0.0.1"
    database_uri: str = ""


class DevSettings(SharedSettings):
    pass


class ProdSettings(SharedSettings):
    pass


@lru_cache()
def get_settings():
    app_env = os.getenv("NSMQCompanion_ENVIRONMENT", "")
    if app_env is None:
        return DevSettings()