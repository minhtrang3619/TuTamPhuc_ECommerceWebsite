"""add_videos_to_reviews

Revision ID: f795a019a5b2
Revises: 31113e52a49f
Create Date: 2026-06-15 16:27:12.792326
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'f795a019a5b2'
down_revision: Union[str, None] = '31113e52a49f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('reviews')]
    if 'videos' not in columns:
        op.add_column('reviews', sa.Column('videos', sa.JSON(), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('reviews')]
    if 'videos' in columns:
        op.drop_column('reviews', 'videos')
