from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import AppException
from app.utils import cos as cos_utils


def save_upload_file(upload_file: UploadFile) -> tuple[str, str, int]:
    settings = get_settings()
    object_key = cos_utils.generate_object_key(upload_file.filename)
    stored_filename = Path(object_key).name

    content = upload_file.file.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise AppException(message="file too large", code=4005, status_code=400)

    cos_utils.upload_bytes(
        key=object_key,
        body=content,
        content_type=upload_file.content_type or "application/octet-stream",
    )
    return stored_filename, object_key, len(content)
