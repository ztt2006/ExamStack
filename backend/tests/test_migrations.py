from pathlib import Path


VERSIONS_DIR = Path(__file__).resolve().parents[1] / "alembic" / "versions"
INIT_MIGRATION = VERSIONS_DIR / "2fdb505cd27f_init.py"


def test_init_migration_matches_minimal_resource_schema() -> None:
    content = INIT_MIGRATION.read_text(encoding="utf-8")

    assert "op.create_table('subjects'" not in content
    assert "sa.Column('title'" not in content
    assert "sa.Column('term'" not in content
    assert "sa.Column('resource_type'" not in content
    assert "sa.Column('tags'" not in content
    assert "sa.Column('subject_id'" not in content

    assert "sa.Column('description'" in content
    assert "sa.Column('original_filename'" in content
    assert "sa.Column('stored_filename'" in content
    assert "sa.Column('file_path'" in content
    assert "sa.Column('file_size'" in content
    assert "sa.Column('mime_type'" in content
    assert "sa.Column('uploader_id'" in content


def test_followup_migration_exists_to_remove_legacy_resource_columns() -> None:
    followup_migrations = [
        path for path in VERSIONS_DIR.glob("*.py") if path.name != INIT_MIGRATION.name
    ]

    assert followup_migrations

    combined_content = "\n".join(
        path.read_text(encoding="utf-8") for path in followup_migrations
    )

    assert 'op.drop_table("subjects")' in combined_content
    assert 'batch_op.drop_column("title")' in combined_content
    assert 'batch_op.drop_column("term")' in combined_content
    assert 'batch_op.drop_column("resource_type")' in combined_content
    assert 'batch_op.drop_column("tags")' in combined_content
    assert 'batch_op.drop_column("subject_id")' in combined_content
