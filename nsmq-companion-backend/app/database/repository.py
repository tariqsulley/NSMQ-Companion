from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.helpers import get_all_items
from app.utils.email import send_email
from app.utils.hashing import VERIFY_TOKEN_EXPIRE_DAYS, hash_user_password
from sqlalchemy.dialects.postgresql import UUID

from . import models, schemas
import logging


def get_all_users(db: Session):
    return get_all_items(db, models.Facilitator)


def update_user_by_uuid(db: Session, uuid: str, user: schemas.UpdateUser):
    user_to_update = db.query(models.User).filter(models.Facilitator.uuid == uuid).first()
    user_to_update.phone_number = user.phone_number
    user_to_update.address = user.address
    user_to_update.location = user.location

    db.commit()
    db.refresh(user_to_update)
    return user


def get_user_by_email_address(email: str, db: Session):
    user = db.query(models.Facilitator).filter(models.Facilitator.email_address == email).first()
    return user 
    # try:
    #     user = db.query(models.Facilitator).filter(models.Facilitator.email_address == email).first()
    #     if user:
    #         return user
    # except Exception:
    #     raise HTTPException(status_code=400, detail="User not found")


def get_user_by_phone_number(db: Session, phone_number: str):
    return (
        db.query(models.User).filter(models.Facilitator.phone_number == phone_number).first()
    )


# def hash_user_password(password: str):
#     pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#     return pwd_context.hash(password)


def create_user(db: Session, user: schemas.Facilitator):
    try:
        db_user = models.Facilitator(
            first_name=user.first_name,
            last_name=user.last_name,
            school = user.school,
            email_address=user.email_address,
            account_type = user.account_type,
            password=hash_user_password(user.password),
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        created_user = (
            db.query(models.Facilitator)
            .filter(models.Facilitator.email_address == db_user.email_address)
            .first()
        )

        returned_user = {
            "first_name": created_user.first_name,
            "last_name": created_user.last_name,
            "email_address": created_user.email_address,
            "account_type":created_user.account_type,
            "uuid": created_user.uuid,
        }

        return returned_user
    except Exception as e:
        logging.error(f"Failed to create user: {e}")
        raise HTTPException(status_code=400, detail=f"{e}")


def create_verification_token(
    db: Session,
    user_verify: schemas.UserEmailVerification,
    verification_token: schemas.EmailVerification,
) -> bool:
    try:
        current_date = datetime.now()
        # return user_verify

        db_verify = models.EmailVerification(
            facilitator_uuid=user_verify.uuid,
            verification_token=verification_token["verification_token"],
            expiry_date=current_date + timedelta(days=VERIFY_TOKEN_EXPIRE_DAYS),
        )

        db.add(db_verify)
        db.commit()

        db_user = (
            db.query(models.Facilitator).filter(models.Facilitator.uuid == user_verify.uuid).first()
        )

        # return result
        # send email
        subject = "NSMQ Companion tracking email verification"

        message = "Please use the button link below to verify your account and get started with the NSMQ Companion App."

        return send_email(
            subject=subject,
            recipient=db_user.first_name,
            email=db_user.email_address,
            message=message,
            token=db_verify.verification_token,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"{e}")
    
def create_student(db: Session, student: schemas.StudentCreate):
    hashed_password = hash_user_password("password")
    db_student = models.Student(
        first_name=student.first_name,
        last_name=student.last_name,
        year=student.year,
        email_address=student.email_address,
        password=hashed_password,
        account_type = "student",
        facilitator_uuid=student.facilitator_uuid
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_students_by_facilitator_uuid(db: Session, uuid: UUID):
    return db.query(models.Student).filter(models.Student.facilitator_uuid == uuid).all()


def get_user_by_uuid(db: Session, user_uuid: UUID):
    # First try to fetch the user from the Facilitator table
    user = db.query(models.Facilitator).filter(models.Facilitator.uuid == user_uuid).first()
    if user:
        return user

    # If not found, try to fetch from the Student table
    user = db.query(models.Student).filter(models.Student.uuid == user_uuid).first()
    if user:
        return user

    # If no user is found in any table
    return None