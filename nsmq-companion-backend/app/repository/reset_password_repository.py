from contextlib import AbstractContextManager
from datetime import datetime, timedelta
from typing import Callable

from sqlalchemy.orm import Session

from app.core.security import generate_reset_token, hash_user_password
from app.core.settings import setting
from app.model.password_reset import PasswordReset
from app.model.user import User
from app.repository.base_repository import BaseRepository


class PasswordResetRepository(BaseRepository):
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory
        super().__init__(session_factory, PasswordReset)

    def reset_password(self, user_uuid: str):
        with self.session_factory() as session:
            current_date = datetime.now()
            password_token = generate_reset_token()

            # check if user has a password reset request
            reset_token = (
                session.query(self.model)
                .filter(self.model.user_uuid == user_uuid)
                .first()
            )

            if reset_token:
                # check if token has expired
                if reset_token.expiry_date < current_date:
                    # delete old token and create a new one
                    session.delete(reset_token)
                    session.commit()

                    password_reset_data = self.model(
                        user_uuid=user_uuid,
                        password_token=password_token,
                        expiry_date=current_date
                        + timedelta(days=setting.PASSWORD_RESET_TOKEN_EXPIRE_DAYS),
                    )
                    session.add(password_reset_data)
                    session.commit()
                    return password_token
                else:
                    return reset_token.password_token
            else:
                password_reset_data = self.model(
                    user_uuid=user_uuid,
                    password_token=password_token,
                    expiry_date=current_date
                    + timedelta(days=setting.PASSWORD_RESET_TOKEN_EXPIRE_DAYS),
                )
                session.add(password_reset_data)
                session.commit()

                return password_token

    def update_password(
        self, token: str, new_password: str, password_confirmation: str
    ):
        with self.session_factory() as session:
            current_date = datetime.now()

            # check if new password and confirm password match
            if not new_password == password_confirmation:
                raise Exception("New password and confirm password does not match")

            # check if token exist
            reset_token = (
                session.query(self.model)
                .filter(self.model.password_token == token)
                .first()
            )

            if not reset_token:
                raise Exception("Invalid token provided")

            if reset_token.expiry_date < current_date:
                raise Exception("Token has expired")

            user = (
                session.query(User).filter(User.uuid == reset_token.user_uuid).first()
            )

            if not user:
                raise Exception("User not found")

            # Update the password with the new hashed password
            user.password = hash_user_password(new_password)
            session.commit()
            session.refresh(user)

            return user