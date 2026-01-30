from sqlmodel import Session, select
from app.database import create_db_and_tables, engine
from app.models import User, Organization
from app.auth import get_password_hash
import sys

def seed_db():
    create_db_and_tables()
    
    with Session(engine) as session:
        # Check if Admin Org exists
        statement = select(Organization).where(Organization.name == "Antigravity Admin")
        org = session.exec(statement).first()
        
        if not org:
            print("Creating Admin Organization...")
            org = Organization(name="Antigravity Admin")
            session.add(org)
            session.commit()
            session.refresh(org)
            
        # Check if Admin User exists
        statement = select(User).where(User.email == "admin@antigravity.com")
        user = session.exec(statement).first()
        
        if not user:
            print("Creating Admin User...")
            user = User(
                email="admin@antigravity.com",
                hashed_password=get_password_hash("admin123"), # Default password
                role="admin",
                is_superuser=True,
                organization=org
            )
            session.add(user)
            session.commit()
            print("Admin User Created: admin@antigravity.com / admin123")
        else:
            print("Admin User already exists.")

if __name__ == "__main__":
    seed_db()
