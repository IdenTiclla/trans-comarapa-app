"""
Alembic environment configuration for Trans Comarapa.
"""
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()
from db.base import Base
from models.user import User
from models.client import Client
from models.driver import Driver
from models.assistant import Assistant
from models.secretary import Secretary
from models.administrator import Administrator
from models.bus import Bus
from models.seat import Seat
from models.route import Route
from models.location import Location
from models.trip import Trip
from models.ticket import Ticket
from models.ticket_state_history import TicketStateHistory
from models.package import Package
from models.package_item import PackageItem
from models.package_state_history import PackageStateHistory
from models.activity import Activity
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")
def run_migrations_offline():
    context.configure(url=DATABASE_URL, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "format"})
    with context.begin_transaction():
        context.run_migrations()
def run_migrations_online():
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
