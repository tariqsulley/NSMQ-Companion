from enum import Enum
from app.core.constants import ADMIN_USER_ROLE, CUSTOMER_USER_ROLE


class AccountType(str, Enum):
    STUDENT = "student"
    FACILITATOR = "facilitator"
    ADMIN = "admin"

class RoleType(str, Enum):
    CUSTOMER  = "customer"
    ADMIN = "admin"

class UserRole(str, Enum):
    CUSTOMER = CUSTOMER_USER_ROLE
    ADMIN = ADMIN_USER_ROLE

class EmailPurpose(str, Enum):
    EMAIL_VERIFICATION = "Verify_Token"
    EMAIL_OTP = "OTP"
    INVITATION = "Invitation"
    PASSWORD_RESET = "Password_Reset"

class ActiveStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEACTIVATED = "deactivated"
