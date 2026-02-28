"""add_missing_tables

Revision ID: 07da8aaee1d1
Revises: 25c773615ff8
Create Date: 2026-02-27 15:43:04.370102

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "07da8aaee1d1"
down_revision: Union[str, Sequence[str], None] = "25c773615ff8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "route_schedules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("route_id", sa.Integer(), nullable=False),
        sa.Column("departure_time", sa.Time(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("route_id", "departure_time", name="uq_route_departure_time")
    )
    op.create_index(op.f("ix_route_schedules_id"), "route_schedules", ["id"], unique=False)

def downgrade() -> None:
    op.drop_index(op.f("ix_route_schedules_id"), table_name="route_schedules")
    op.drop_table("route_schedules")
