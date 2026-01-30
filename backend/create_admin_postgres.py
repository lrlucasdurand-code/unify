from sqlmodel import Session, select
from app.database import engine
from app.models import User, Organization
from app.auth import get_password_hash

def create_admin():
    with Session(engine) as session:
        # Check if user exists
        statement = select(User).where(User.email == "admin@antigravity.com")
        user = session.exec(statement).first()
        
        if user:
            print("Admin user already exists. Updating credentials.")
            user.hashed_password = get_password_hash("admin123")
            user.is_superuser = True
            user.role = "admin"
            session.add(user)
            session.commit()
            print("Admin updated.")
            return

        # Create Organization
        org = Organization(name="Antigravity Admin")
        session.add(org)
        session.commit()
        session.refresh(org)

        # Create User
        user = User(
            email="admin@antigravity.com",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            organization_id=org.id,
            is_superuser=True,
            role="admin",
            is_active=True
        )
        session.add(user)
        session.commit()
        print("Admin user created: admin@antigravity.com / admin123")

if __name__ == "__main__":
    create_admin()
