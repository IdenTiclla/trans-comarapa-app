import sys
import os

from db.session import SessionLocal
from models.office import Office
from models.user import User

db = SessionLocal()
offices = db.query(Office).all()
print("Offices:", [(o.id, o.name) for o in offices])
users = db.query(User).all()
print("Users:", [(u.id, u.email, u.role, u.office_id) for u in users])
