"""
seed.py - Create a minimal set of test users.

Run from the backend/ directory:
    python seed.py

Creates:
  - 1 admin:  admin@test.com  / admin123
  - 1 user:   user@test.com   / user123
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import create_db_and_tables, engine
from models import User
from auth import hash_password
from sqlmodel import Session, select

USERS = [
    {"email": "admin@test.com", "name": "Admin",     "password": "admin123", "role": "admin"},
    {"email": "user@test.com",  "name": "Test User", "password": "user123",  "role": "user"},
]

def seed():
    create_db_and_tables()
    with Session(engine) as session:
        for u in USERS:
            exists = session.exec(select(User).where(User.email == u["email"])).first()
            if exists:
                print(f"  SKIP  {u['email']} (already exists)")
            else:
                session.add(User(
                    email=u["email"],
                    name=u["name"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                ))
                session.commit()
                print(f"  OK    {u['email']}  /  {u['password']}")

    print("\nDone. Database: backend/euslugi.db")

if __name__ == "__main__":
    seed()
