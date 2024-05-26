import structlog
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.configs.settings import settings

user = settings.DB_USER
password = settings.DB_PASSWORD
host = settings.DB_HOST
port = settings.DB_PORT
database = settings.DB_NAME

POSTGRES_DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{database}"

engine = create_engine(POSTGRES_DATABASE_URL)
log = structlog.get_logger()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

try:
    with engine.connect() as connection_str:
        log.info("Successfully connected to the PostgreSQL database")
except Exception as ex:
    log.info(f"Sorry failed to connect: {ex}")

Base = declarative_base()


def init_db():
    Base.metadata.create_all(engine)