"""init

Revision ID: 2fdb505cd27f
Revises: 
Create Date: 2026-05-09 23:09:24.877819

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2fdb505cd27f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('school', sa.String(length=120), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('points', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_table('point_transactions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('change_amount', sa.Integer(), nullable=False),
    sa.Column('reason', sa.String(length=120), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_point_transactions_user_id'), 'point_transactions', ['user_id'], unique=False)
    op.create_table('resources',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('original_filename', sa.String(length=255), nullable=False),
    sa.Column('stored_filename', sa.String(length=255), nullable=False),
    sa.Column('file_path', sa.String(length=500), nullable=False),
    sa.Column('file_size', sa.Integer(), nullable=False),
    sa.Column('mime_type', sa.String(length=120), nullable=False),
    sa.Column('download_count', sa.Integer(), nullable=False),
    sa.Column('uploader_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['uploader_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('stored_filename')
    )
    op.create_index(op.f('ix_resources_id'), 'resources', ['id'], unique=False)
    op.create_index(op.f('ix_resources_uploader_id'), 'resources', ['uploader_id'], unique=False)
    op.create_table('download_records',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['resource_id'], ['resources.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_download_records_resource_id'), 'download_records', ['resource_id'], unique=False)
    op.create_index(op.f('ix_download_records_user_id'), 'download_records', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_download_records_user_id'), table_name='download_records')
    op.drop_index(op.f('ix_download_records_resource_id'), table_name='download_records')
    op.drop_table('download_records')
    op.drop_index(op.f('ix_resources_uploader_id'), table_name='resources')
    op.drop_index(op.f('ix_resources_id'), table_name='resources')
    op.drop_table('resources')
    op.drop_index(op.f('ix_point_transactions_user_id'), table_name='point_transactions')
    op.drop_table('point_transactions')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
