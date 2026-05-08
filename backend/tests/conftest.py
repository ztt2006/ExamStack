from pathlib import Path

import pytest

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine


@pytest.fixture(autouse=True)
def reset_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    for item in upload_dir.iterdir():
        if item.name != ".gitkeep" and item.is_file():
            item.unlink()
