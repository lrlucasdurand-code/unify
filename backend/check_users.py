from sqlmodel import Session, select
from app.database import engine
from app.models import User, Organization

def list_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"Found {len(users)} users:")
        for u in users:
            org = u.organization
            plan = org.plan if org else "None"
            print(f"ID: {u.id} | Email: '{u.email}' | Org: {org.name if org else 'None'} | Plan: {plan}")

if __name__ == "__main__":
    list_users()
