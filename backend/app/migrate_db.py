from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as connection:
        try:
            connection.execute(text("ALTER TABLE organization ADD COLUMN stripe_customer_id VARCHAR"))
            print("Migration successful: Added stripe_customer_id to organization table")
        except Exception as e:
            print(f"Migration failed (maybe column exists): {e}")

if __name__ == "__main__":
    migrate()
