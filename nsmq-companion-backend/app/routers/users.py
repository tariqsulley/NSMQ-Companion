from typing import List,Union

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import UUID

from app.database.repository import (
    create_user,
    create_student,
    get_students_by_facilitator_uuid,
    get_all_users,
    get_user_by_email_address,
    get_user_by_uuid,
    delete_student_by_uuid
)


from app.core.security import get_current_user
from app.schemas.facilitator import Facilitator
from app.schemas.student import StudentCreate,StudentBase

from .shared import get_db

router = APIRouter(
    prefix="/facilitators",
    tags=["facilitator"],
)

@router.post("/create", response_model=None)
async def create_facilitator_handler(user: Facilitator, db: Session = Depends(get_db)):
    if get_user_by_email_address(db=db, email=user.email_address):
        raise HTTPException(status_code=400, detail="Email already exists")
    return create_user(db, user)


@router.get("/", response_model=List[Facilitator])
async def get_users_handler(
    db: Session = Depends(get_db), user: Facilitator = Depends(get_db)
):
    return get_all_users(db=db)

@router.get("/{email_address}", response_model=None)
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    return get_user_by_email_address(email, db=db)

@router.post("/students/create", response_model=StudentBase)
async def create_student_handler(student: StudentCreate, db: Session = Depends(get_db)):
    return create_student(db, student)

@router.get("/students/{facilitator_uuid}", response_model=List[StudentBase])
async def get_students_for_facilitator(facilitator_uuid: str, db: Session = Depends(get_db)):
    students = get_students_by_facilitator_uuid(db, facilitator_uuid)
    return students

@router.get("/{user_uuid}/find", response_model=None)
async def get_user_by_uuid_endpoint(user_uuid: str, db: Session = Depends(get_db)):
    user = get_user_by_uuid(db, user_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/facilitators/{facilitator_uuid}/students/{student_uuid}", response_model=None)
async def delete_student(facilitator_uuid: str, student_uuid: str, db: Session = Depends(get_db)):
    result = delete_student_by_uuid(db, facilitator_uuid, student_uuid)
    if not result:
        raise HTTPException(status_code=404, detail="Student not found or not associated with this facilitator")
    return {"detail": "Student deleted successfully"}