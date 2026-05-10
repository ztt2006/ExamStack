from io import BytesIO
from pathlib import Path
from collections.abc import Iterator
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


def download_chunk_iter(key: str, chunk_size: int = 1024 * 1024) -> tuple[Iterator[bytes], str]:
    settings = get_settings()
    client = get_cos_client()
    response = client.get_object(
        Bucket=settings.cos_bucket,
        Key=key,
    )
    content_type = response.get("ContentType") or "application/octet-stream"
    raw_stream = response["Body"].get_raw_stream()

    def iter_chunks() -> Iterator[bytes]:
        while True:
            chunk = raw_stream.read(chunk_size)
            if not chunk:
                break
            yield chunk

    return iter_chunks(), content_type


def download_range_stream(key: str, start: int, end: int | None = None):
    settings = get_settings()
    client = get_cos_client()
    range_header = f"bytes={start}-{'' if end is None else end}"
    response = client.get_object(
        Bucket=settings.cos_bucket,
        Key=key,
        Range=range_header,
    )
    content_type = response.get("ContentType") or "application/octet-stream"
    content_range = response.get("Content-Range") or response.get("ContentRange") or ""
    total_size = _parse_total_size(content_range)
    stream = response["Body"]
    return BytesIO(stream.get_raw_stream().read()), content_type, total_size


def _parse_total_size(content_range: str) -> int | None:
    if "/" not in content_range:
        return None
    total = content_range.rsplit("/", 1)[-1]
    if total == "*":
        return None
    try:
        return int(total)
    except ValueError:
        return None


def delete_object(key: str) -> None:
    settings = get_settings()
    client = get_cos_client()
    client.delete_object(
        Bucket=settings.cos_bucket,
        Key=key,
    )
