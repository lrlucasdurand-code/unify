from sqlmodel import Session, select
from app.database import engine
from app.models import User, Organization
import sys

def upgrade_user(email):
    with Session(engine) as session:
        # Case insensitive email search might be safer? For now, exact match.
        user = session.exec(select(User).where(User.email == email)).first()
        
        if not user:
            print(f"❌ Erreur : L'utilisateur {email} est introuvable dans la base locale.")
            print("👉 Connectez-vous au moins une fois sur le site pour que le compte soit créé.")
            return

        print(f"Trouvé utilisateur : {user.email} (ID: {user.id})")

        if not user.organization:
            print("⚠️ Pas d'organisation ratachée. Création d'une nouvelle...")
            org = Organization(name=f"Entreprise de {user.full_name or 'User'}", plan="starter")
            session.add(org)
            session.commit()
            session.refresh(org)
            user.organization_id = org.id
            session.add(user)
            session.commit()
        else:
            print(f"Organisation existante : {user.organization.name}. Passage en STARTER...")
            user.organization.plan = "starter"
            session.add(user.organization)
            session.commit()
            
        print(f"✅ SUCCÈS : {email} est maintenant ABONNÉ PAYANT (Starter) !")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python upgrade_user.py <email>")
        sys.exit(1)
    upgrade_user(sys.argv[1])
