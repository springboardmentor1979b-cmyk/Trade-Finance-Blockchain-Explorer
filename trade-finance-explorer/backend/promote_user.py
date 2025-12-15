from database import SessionLocal
from models import User, UserRole
import sys

def promote_to_admin():
    db = SessionLocal()
    
    print("\n👑 --- PROMOTE USER TO ADMIN ---")
    email = input("Enter the email of the user to promote: ").strip()

    if not email:
        print("❌ Error: Email is required.")
        return

    # 1. Find the user
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"❌ Error: User with email '{email}' not found in the database.")
        db.close()
        return

    # 2. Check current role
    print(f"   Found User: {user.name}")
    print(f"   Current Role: {user.role}")

    if user.role == UserRole.ADMIN:
        print("✅ This user is ALREADY an Admin.")
        db.close()
        return

    # 3. Update to Admin
    try:
        user.role = UserRole.ADMIN
        db.commit()
        print(f"✅ SUCCESS: User '{email}' has been promoted to ADMIN.")
        print("👉 Log out and log back in to see the Admin Dashboard.")
    except Exception as e:
        print(f"❌ Database Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    promote_to_admin()