"""simplify resource schema

Revision ID: 8d9d6a4f1b2c
Revises: 2fdb505cd27f
Create Date: 2026-05-10 00:20:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8d9d6a4f1b2c"
down_revision: Union[str, Sequence[str], None] = "2fdb505cd27f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    table_names = set(inspector.get_table_names())

    if "resources" in table_names:
        resource_indexes = {index["name"] for index in inspector.get_indexes("resources")}

        for index_name in (
            "ix_resources_title",
            "ix_resources_term",
            "ix_resources_resource_type",
            "ix_resources_subject_id",
        ):
            if index_name in resource_indexes:
                op.drop_index(index_name, table_name="resources")

        with op.batch_alter_table("resources") as batch_op:
            existing_columns = {
                column["name"] for column in inspector.get_columns("resources")
            }

            if "subject_id" in existing_columns:
                foreign_keys = inspector.get_foreign_keys("resources")
                subject_fk = next(
                    (
                        foreign_key["name"]
                        for foreign_key in foreign_keys
                        if foreign_key.get("referred_table") == "subjects"
                    ),
                    None,
                )
                if subject_fk:
                    batch_op.drop_constraint(subject_fk, type_="foreignkey")

            for column_name in (
                "title",
                "term",
                "resource_type",
                "tags",
                "subject_id",
            ):
                if column_name in existing_columns:
                    batch_op.drop_column(column_name)

    if "subjects" in table_names:
        subject_indexes = {index["name"] for index in inspector.get_indexes("subjects")}
        for index_name in (
            "ix_subjects_category",
            "ix_subjects_code",
            "ix_subjects_id",
            "ix_subjects_name",
        ):
            if index_name in subject_indexes:
                op.drop_index(index_name, table_name="subjects")
        op.drop_table("subjects")


def downgrade() -> None:
    op.create_table(
        "subjects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_subjects_category", "subjects", ["category"], unique=False)
    op.create_index("ix_subjects_code", "subjects", ["code"], unique=True)
    op.create_index("ix_subjects_id", "subjects", ["id"], unique=False)
    op.create_index("ix_subjects_name", "subjects", ["name"], unique=True)

    with op.batch_alter_table("resources") as batch_op:
        batch_op.add_column(sa.Column("title", sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column("term", sa.String(length=80), nullable=True))
        batch_op.add_column(sa.Column("resource_type", sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column("tags", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("subject_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "resources_subject_id_fkey",
            "subjects",
            ["subject_id"],
            ["id"],
        )

    op.create_index("ix_resources_title", "resources", ["title"], unique=False)
    op.create_index("ix_resources_term", "resources", ["term"], unique=False)
    op.create_index("ix_resources_resource_type", "resources", ["resource_type"], unique=False)
    op.create_index("ix_resources_subject_id", "resources", ["subject_id"], unique=False)
