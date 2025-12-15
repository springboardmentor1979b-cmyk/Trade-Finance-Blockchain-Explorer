from database import engine
from models import Base

print("⚠️  DROPPING ALL TABLES...")
Base.metadata.drop_all(bind=engine)
print("✅  All tables dropped.")

print("🔄  RECREATING TABLES...")
Base.metadata.create_all(bind=engine)
print("✅  Database reset complete. You may now restart the server.")

'''
#### **Step 2: Run the Reset**
1.  Stop your backend server (Ctrl+C).
2.  Run the reset script:
    ```powershell
    python reset_db.py
    ```
3.  Start your server again:
    ```powershell
    uvicorn main:app --reload

'''