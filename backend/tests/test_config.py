from app.core.config import Settings


def test_default_database_url_uses_postgresql() -> None:
    assert Settings.model_fields["database_url"].default.startswith("postgresql+psycopg://")
