from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import UUID

from app.database import schemas
from app.database.repository import (
    create_user,
    create_student,
    get_students_by_facilitator_uuid,
    get_all_users,
    get_user_by_email_address,
    update_user_by_uuid,
)
from app.utils.auth import get_current_user

from .shared import get_db

router = APIRouter(
    prefix="/facilitators",
    tags=["facilitator"],
)


@router.post("/create", response_model=None)
async def create_facilitator_handler(user: schemas.Facilitator, db: Session = Depends(get_db)):
    if get_user_by_email_address(db=db, email=user.email_address):
        raise HTTPException(status_code=400, detail="Email already exists")
    return create_user(db, user)


@router.get("/", response_model=List[schemas.Facilitator])
async def get_users_handler(
    db: Session = Depends(get_db), user: schemas.Facilitator = Depends(get_db)
):
    return get_all_users(db=db)


@router.put("/update/{uuid}", response_model=schemas.UpdateUser)
async def update_user(
    uuid: str,
    user: schemas.UpdateUser,
    db: Session = Depends(get_db),
    auth_user: schemas.Facilitator = Depends(get_current_user),
):
    return update_user_by_uuid(uuid=uuid, user=user, db=db)


@router.get("/{email_address}", response_model=schemas.UserEmail)
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    return get_user_by_email_address(email, db=db)

@router.post("/students/create", response_model=schemas.StudentBase)
async def create_student_handler(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return create_student(db, student)

@router.get("/students/{facilitator_uuid}", response_model=List[schemas.StudentBase])
async def get_students_for_facilitator(facilitator_uuid: str, db: Session = Depends(get_db)):
    students = get_students_by_facilitator_uuid(db, facilitator_uuid)
    return students