from enum import Enum


class AccountType(str, Enum):
    ORGANISATION = "orgnization"
    INDIVIDUAL = "individual"


class ActiveInactive(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"