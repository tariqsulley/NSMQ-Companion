from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.core import init_db
from app.routers import (
 
    authentication,
    questions,
    system,
    users,
)

app = FastAPI(
    title="NSMQ Companion",
    description=None,
    summary="",
    version="0.0.1",
)

app.include_router(system.router)
app.include_router(users.router)
app.include_router(authentication.router)
app.include_router(questions.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "https://localhost:8000",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost",
    ],
    # allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()