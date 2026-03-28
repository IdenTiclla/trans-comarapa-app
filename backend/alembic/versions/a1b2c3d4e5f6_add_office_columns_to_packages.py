"""Add office columns to packages

Revision ID: a1b2c3d4e5f6
Revises: eba9585ef1d2
Create Date: 2026-03-16 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "eba9585ef1d2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("packages") as batch_op:
        batch_op.add_column(sa.Column("origin_office_id", sa.Integer(), nullable=True))
        batch_op.add_column(
            sa.Column("destination_office_id", sa.Integer(), nullable=True)
        )
        batch_op.add_column(
            sa.Column("delivered_by_secretary_id", sa.Integer(), nullable=True)
        )
        batch_op.create_foreign_key(
            "fk_packages_origin_office_id", "offices", ["origin_office_id"], ["id"]
        )
        batch_op.create_foreign_key(
            "fk_packages_destination_office_id",
            "offices",
            ["destination_office_id"],
            ["id"],
        )
        batch_op.create_foreign_key(
            "fk_packages_delivered_by_secretary_id",
            "secretaries",
            ["delivered_by_secretary_id"],
            ["id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("packages") as batch_op:
        batch_op.drop_constraint(
            "fk_packages_delivered_by_secretary_id", type_="foreignkey"
        )
        batch_op.drop_constraint(
            "fk_packages_destination_office_id", type_="foreignkey"
        )
        batch_op.drop_constraint("fk_packages_origin_office_id", type_="foreignkey")
        batch_op.drop_column("delivered_by_secretary_id")
        batch_op.drop_column("destination_office_id")
        batch_op.drop_column("origin_office_id")
