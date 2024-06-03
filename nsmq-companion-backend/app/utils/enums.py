from enum import Enum


class FileFormat(str, Enum):
    PDF = "pdf"
    PNG = "png"
    JPEG = "jpeg"
    JPG = "jpg"
