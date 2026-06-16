"""add_video_url_to_products

Revision ID: ce541a6b2a31
Revises: f795a019a5b2
Create Date: 2026-06-15 16:35:52.122986
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'ce541a6b2a31'
down_revision: Union[str, None] = 'f795a019a5b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('products')]
    if 'video_url' not in columns:
        op.add_column('products', sa.Column('video_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('products')]
    if 'video_url' in columns:
        op.drop_column('products', 'video_url')
