from database import SessionLocal
import models
import auth
import sys

def create_super_admin():
    db = SessionLocal()
    
    print("\n🔐 --- CREATE SUPER ADMIN ---")
    email = input("Enter Admin Email: ").strip()
    password = input("Enter Admin Password: ").strip()
    name = input("Enter Admin Name (e.g. Super Admin): ").strip()
    org_name = input("Enter Organization Name (e.g. HQ): ").strip()

    if not email or not password:
        print("❌ Error: Email and Password are required.")
        return

    # 1. Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        print(f"❌ Error: User with email '{email}' already exists!")
        db.close()
        return

    # 2. Hash the password securely
    hashed_password = auth.get_password_hash(password)

    # 3. Create the User with ADMIN role
    admin_user = models.User(
        name=name,
        email=email,
        password=hashed_password,
        role=models.UserRole.ADMIN, # This sets the restricted role
        org_name=org_name
    )

    try:
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"\n✅ SUCCESS: Admin user '{email}' created.")
        print("👉 You can now log in at /login using these credentials.")
    except Exception as e:
        print(f"❌ Database Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()


