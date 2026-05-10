from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = Field(default="ExamStack API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=True, alias="APP_DEBUG")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@127.0.0.1:5432/examstack",
        alias="DATABASE_URL",
    )
    jwt_secret_key: str = Field(default="change-me-in-production", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60 * 24 * 7, alias="JWT_EXPIRE_MINUTES")
    initial_user_points: int = Field(default=20, alias="INITIAL_USER_POINTS")
    upload_reward_points: int = Field(default=5, alias="UPLOAD_REWARD_POINTS")
    download_cost_points: int = Field(default=5, alias="DOWNLOAD_COST_POINTS")
    upload_dir: str = Field(
        default=str(BASE_DIR / "app" / "static" / "uploads"),
        alias="UPLOAD_DIR",
    )
    max_upload_size_mb: int = Field(default=50, alias="MAX_UPLOAD_SIZE_MB")
    cos_secret_id: str = Field(default="", alias="COS_SECRET_ID")
    cos_secret_key: str = Field(default="", alias="COS_SECRET_KEY")
    cos_region: str = Field(default="", alias="COS_REGION")
    cos_bucket: str = Field(default="", alias="COS_BUCKET")
    cos_prefix: str = Field(default="examstack/uploads", alias="COS_PREFIX")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        populate_by_name=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    return settings
