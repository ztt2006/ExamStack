from io import BytesIO
from pathlib import Path
from uuid import uuid4

from qcloud_cos import CosConfig, CosS3Client

from app.core.config import get_settings
from app.core.exceptions import AppException


def _normalize_prefix(prefix: str) -> str:
    return prefix.strip().strip("/")


def _build_object_key(filename: str | None) -> str:
    settings = get_settings()
    suffix = Path(filename or "").suffix or ".bin"
    object_name = f"{uuid4().hex}{suffix}"
    prefix = _normalize_prefix(settings.cos_prefix)
    return f"{prefix}/{object_name}" if prefix else object_name


def get_cos_client() -> CosS3Client:
    settings = get_settings()
    if not all([settings.cos_secret_id, settings.cos_secret_key, settings.cos_region, settings.cos_bucket]):
        raise AppException(message="cos configuration is incomplete", code=5001, status_code=500)

    config = CosConfig(
        Region=settings.cos_region,
        SecretId=settings.cos_secret_id,
        SecretKey=settings.cos_secret_key,
    )
    return CosS3Client(config)


def generate_object_key(filename: str | None) -> str:
    return _build_object_key(filename)


def upload_bytes(*, key: str, body: bytes, content_type: str) -> None:
    settings = get_settings()
    client = get_cos_client()
    client.put_object(
        Bucket=settings.cos_bucket,
        Body=body,
        Key=key,
        ContentType=content_type,
    )


def download_bytes(key: str) -> tuple[bytes, str]:
    settings = get_settings()
    client = get_cos_client()
    response = client.get_object(
        Bucket=settings.cos_bucket,
        Key=key,
    )
    stream = response["Body"]
    body = stream.get_raw_stream().read()
    content_type = response.get("ContentType") or "application/octet-stream"
    return body, content_type


def download_stream(key: str):
    settings = get_settings()
    client = get_cos_client()
    response = client.get_object(
        Bucket=settings.cos_bucket,
        Key=key,
    )
    content_type = response.get("ContentType") or "application/octet-stream"
    stream = response["Body"]
    return BytesIO(stream.get_raw_stream().read()), content_type


def delete_object(key: str) -> None:
    settings = get_settings()
    client = get_cos_client()
    client.delete_object(
        Bucket=settings.cos_bucket,
        Key=key,
    )
