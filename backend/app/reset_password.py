from sqlmodel import Session, select
from app.database import engine
from app.models import User
from app.auth import get_password_hash

def reset_admin_password():
    with Session(engine) as session:
        statement = select(User).where(User.email == "admin@antigravity.com")
        user = session.exec(statement).first()
        
        if user:
            print(f"Found user: {user.email}")
            print(f"Old Hash: {user.hashed_password}")
            new_hash = get_password_hash("admin123")
            user.hashed_password = new_hash
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"Password reset. New Hash: {user.hashed_password}")
        else:
            print("User not found")

if __name__ == "__main__":
    reset_admin_password()
