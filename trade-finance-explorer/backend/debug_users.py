from database import SessionLocal
from models import User

# Create a database session
db = SessionLocal()

# Fetch all users
users = db.query(User).all()

print("\n" + "=" * 50)
print(f"🔍 FOUND {len(users)} REGISTERED USERS")
print("=" * 50)

if not users:
    print("❌ No users found! You need to register first.")
else:
    for user in users:
        print(f"🆔 ID: {user.id}")
        print(f"👤 Name: {user.name}")
        print(f"📧 Email: {user.email}")
        print(f"🔐 Role: {user.role}")
        print(f"🏢 Org:  {user.org_name}")
        # We print the first few chars of the hash to ensure it's hashed
        print(f"🔑 Hash: {user.password[:15]}...")
        print("-" * 50)

db.close()
