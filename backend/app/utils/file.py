from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import AppException


def save_upload_file(upload_file: UploadFile) -> tuple[str, str, int]:
    settings = get_settings()
    suffix = Path(upload_file.filename or "").suffix or ".bin"
    stored_filename = f"{uuid4().hex}{suffix}"
    target_path = Path(settings.upload_dir) / stored_filename

    content = upload_file.file.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise AppException(message="file too large", code=4005, status_code=400)

    target_path.write_bytes(content)
    return stored_filename, str(target_path), len(content)
