from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import schemas
from app.database.repository import (
    create_user,
    get_all_users,
    get_user_by_email_address,
    update_user_by_uuid,
)
from app.utils.auth import get_current_user

from .shared import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post("/create", response_model=None)
async def create_user_handler(user: schemas.User, db: Session = Depends(get_db)):
    if get_user_by_email_address(db=db, email=user.email_address):
        raise HTTPException(status_code=400, detail="Email already exists")
    return create_user(db, user)


@router.get("/", response_model=List[schemas.User])
async def get_users_handler(
    db: Session = Depends(get_db), user: schemas.User = Depends(get_current_user)
):
    return get_all_users(db=db)


@router.put("/update/{uuid}", response_model=schemas.UpdateUser)
async def update_user(
    uuid: str,
    user: schemas.UpdateUser,
    db: Session = Depends(get_db),
    auth_user: schemas.User = Depends(get_current_user),
):
    return update_user_by_uuid(uuid=uuid, user=user, db=db)


@router.get("/{email_address}", response_model=schemas.UserEmail)
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    return get_user_by_email_address(email, db=db)