"""add user avatar url

Revision ID: 4b3a1c7e9d2f
Revises: 8d9d6a4f1b2c
Create Date: 2026-05-10 23:40:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "4b3a1c7e9d2f"
down_revision: str | None = "8d9d6a4f1b2c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "avatar_url")
