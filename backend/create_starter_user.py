from sqlmodel import Session, select
from app.database import engine
from app.models import User, Organization
from app.auth import get_password_hash
import sys

def create_starter_user(email, password, org_name="Starter Corp"):
    with Session(engine) as session:
        # Check if user exists
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        
        if user:
            print(f"User {email} already exists. Updating plan to 'starter'.")
            if user.organization:
                user.organization.plan = "starter"
                session.add(user.organization)
            else:
                # Create org if missing (should not happen usually)
                org = Organization(name=org_name, plan="starter")
                session.add(org)
                session.commit()
                session.refresh(org)
                user.organization_id = org.id
                session.add(user)
            
            user.hashed_password = get_password_hash(password)
            session.commit()
            print(f"User {email} updated to Starter plan.")
            return

        # Create Organization with Starter Plan
        org = Organization(name=org_name, plan="starter")
        session.add(org)
        session.commit()
        session.refresh(org)

        # Create User
        user = User(
            email=email,
            full_name="Starter User",
            hashed_password=get_password_hash(password),
            organization_id=org.id,
            is_superuser=False,
            role="user",
            is_active=True
        )
        session.add(user)
        session.commit()
        print(f"✅ User created: {email}")
        print(f"✅ Plan: Starter")
        print(f"✅ Organization: {org_name}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_starter_user.py <email> <password> [org_name]")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    org_name = sys.argv[3] if len(sys.argv) > 3 else "My Company"
    
    create_starter_user(email, password, org_name)
