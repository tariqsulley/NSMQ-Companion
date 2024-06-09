from enum import Enum


class FileFormat(str, Enum):
    PDF = "pdf"
    PNG = "png"
    JPEG = "jpeg"
    JPG = "jpg"

class EmailPurpose(str, Enum):
    EMAIL_VERIFICATION = "Verify_Token"
    PASSWORD_RESET = "Password_Reset"
