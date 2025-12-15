from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import shutil
import os

# IMPORTS
import models, schemas, auth, database, utils 
from database import engine

app = FastAPI()

# Allow React to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Connection successful: FastAPI is running!"}

# ==========================================
# 1. AUTHENTICATION ROUTES
# ==========================================

@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role,
        org_name=user.org_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ==========================================
# 2. DOCUMENT ROUTES
# ==========================================

@app.post("/documents/upload", response_model=schemas.DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    doc_type: models.DocType = Form(...),
    doc_number: str = Form(...),
    issued_at: datetime = Form(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    file_content = file.file.read()
    file_hash = utils.calculate_file_hash(file_content)
    file.file.seek(0)
    
    os.makedirs("uploaded_files", exist_ok=True)
    file_location = f"uploaded_files/{file.filename}"
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_doc = models.Document(
        owner_id=current_user.id,
        doc_type=doc_type,
        doc_number=doc_number,
        file_url=file_location,
        hash=file_hash,
        issued_at=issued_at
    )
    
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@app.get("/documents", response_model=list[schemas.DocumentOut])
def get_my_documents(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Document).filter(models.Document.owner_id == current_user.id).all()

@app.get("/documents/{doc_id}", response_model=schemas.DocumentOut)
def get_document(
    doc_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

# ==========================================
# 3. LEDGER ROUTES (Blockchain History)
# ==========================================

@app.post("/documents/{doc_id}/ledger", response_model=schemas.LedgerEntryOut)
def add_ledger_entry(
    doc_id: int,
    entry: schemas.LedgerEntryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Simple permission check
    if doc.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to update this document")

    new_entry = models.LedgerEntry(
        document_id=doc_id,
        action=entry.action,
        actor_id=current_user.id,
        metadata_info=entry.metadata_info
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@app.get("/documents/{doc_id}/ledger", response_model=list[schemas.LedgerEntryOut])
def get_document_ledger(
    doc_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return db.query(models.LedgerEntry)\
             .filter(models.LedgerEntry.document_id == doc_id)\
             .order_by(models.LedgerEntry.created_at.asc())\
             .all()

# ==========================================
# 4. TRADE TRANSACTION ROUTES 
# ==========================================

@app.post("/transactions", response_model=schemas.TradeTransactionOut)
def create_transaction(
    trade: schemas.TradeTransactionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Find buyer
    buyer = db.query(models.User).filter(models.User.email == trade.buyer_email).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer email not found in system")
    
    if buyer.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot trade with yourself")

    # 2. Create Trade
    new_trade = models.TradeTransaction(
        buyer_id=buyer.id,
        seller_id=current_user.id, # The person creating the trade is the Seller
        amount=trade.amount,
        currency=trade.currency,
        status=models.TradeStatus.PENDING
    )
    
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    return new_trade

@app.get("/transactions", response_model=list[schemas.TradeTransactionOut])
def get_my_transactions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Return trades where I am Buyer OR Seller
    return db.query(models.TradeTransaction).filter(
        (models.TradeTransaction.buyer_id == current_user.id) | 
        (models.TradeTransaction.seller_id == current_user.id)
    ).all()

@app.put("/transactions/{trade_id}", response_model=schemas.TradeTransactionOut)
def update_transaction_status(
    trade_id: int,
    update_data: schemas.TradeTransactionUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    trade = db.query(models.TradeTransaction).filter(models.TradeTransaction.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Only participants can update
    if current_user.id not in [trade.buyer_id, trade.seller_id]:
        raise HTTPException(status_code=403, detail="Not authorized to update this transaction")

    trade.status = update_data.status
    trade.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(trade)
    return trade


# ==========================================
# 5. RISK & ANALYTICS ROUTES (MODULE 4)
# ==========================================

@app.post("/risk/assess/{trade_id}")
def assess_trade_risk(
    trade_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # 1. Fetch the trade
    trade = db.query(models.TradeTransaction).filter(models.TradeTransaction.id == trade_id).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # 2. RISK RULE ENGINE
    # In a real bank, this checks sanctions lists, credit history, etc.
    score = 0
    flags = []

    # Rule A: Amount Thresholds
    if trade.amount > 1000000: # > $1M
        score += 50
        flags.append("High Value Transaction (>1M)")
    elif trade.amount > 100000: # > $100k
        score += 20
        flags.append("Medium Value Transaction (>100k)")

    # Rule B: Currency Risk (Example)
    high_risk_currencies = ["RUB", "CNY", "TRY"] 
    if trade.currency in high_risk_currencies:
        score += 30
        flags.append(f"High Risk Currency ({trade.currency})")

    # Rule C: New Account Risk (Simple logic)
    if trade.id > 100: # Just an example condition
        score += 5

    # 3. Determine Risk Level
    risk_level = "LOW"
    if score >= 50:
        risk_level = "HIGH"
    elif score >= 20:
        risk_level = "MEDIUM"

    return {
        "trade_id": trade_id,
        "risk_score": score,
        "risk_level": risk_level,
        "flags": flags,
        "timestamp": datetime.utcnow()
    }

@app.get("/analytics/dashboard-stats")
def get_dashboard_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # This endpoint aggregates data for the Dashboard charts
    trades = db.query(models.TradeTransaction).filter(
        (models.TradeTransaction.buyer_id == current_user.id) | 
        (models.TradeTransaction.seller_id == current_user.id)
    ).all()
    
    total_volume = sum(t.amount for t in trades)
    risk_distribution = {"low": 0, "medium": 0, "high": 0}
    
    # Calculate distribution based on our rules
    for t in trades:
        if t.amount > 1000000:
            risk_distribution["high"] += 1
        elif t.amount > 100000:
            risk_distribution["medium"] += 1
        else:
            risk_distribution["low"] += 1
            
    return {
        "total_trades": len(trades),
        "total_volume": total_volume,
        "risk_distribution": risk_distribution
    }

# ==========================================
# 6. ADMIN ROUTES (MODULE 5)
# ==========================================

@app.get("/admin/documents", response_model=list[schemas.DocumentWithUser])
def get_all_system_documents(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access Forbidden: Admins Only")
    
    # Advanced Query: Join Documents with User table to get Uploader details
    results = db.query(models.Document, models.User)\
                .join(models.User, models.Document.owner_id == models.User.id)\
                .all()
    
    # Map the results to the new schema that includes owner_name and owner_email
    mapped_results = []
    for doc, user in results:
        item = schemas.DocumentWithUser(
            id=doc.id,
            doc_type=doc.doc_type,
            doc_number=doc.doc_number,
            file_url=doc.file_url,
            hash=doc.hash,
            created_at=doc.created_at,
            issued_at=doc.issued_at,
            # Add User Info
            owner_id=user.id,
            owner_name=user.name,
            owner_email=user.email
        )
        mapped_results.append(item)
        
    return mapped_results

@app.delete("/admin/documents/{doc_id}")
def delete_document_admin(
    doc_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access Forbidden: Admins Only")
    
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(doc)
    db.commit()
    
    return {"message": f"Document #{doc_id} deleted successfully"}

# Get All Users for Admin
@app.get("/admin/users", response_model=list[schemas.UserOut])
def get_all_users_admin(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access Forbidden: Admins Only")
    
    return db.query(models.User).all()


# NEW: Admin Create User
@app.post("/admin/users", response_model=schemas.UserOut)
def create_user_admin(
    user: schemas.UserCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access Forbidden: Admins Only")
    
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role,
        org_name=user.org_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # --- LOGGING ---
    log = models.AuditLog(
        admin_id=current_user.id,
        action=f"Created User: {user.email}",
        target_type="User",
        target_id=new_user.id
    )
    db.add(log)
    db.commit()
    # ---------------

    return new_user

# NEW: Admin Delete User
@app.delete("/admin/users/{user_id}")
def delete_user_admin(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access Forbidden: Admins Only")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account")

    # --- LOGGING ---
    log = models.AuditLog(
        admin_id=current_user.id,
        action=f"Deleted User: {user.email}",
        target_type="User",
        target_id=user_id
    )
    db.add(log)
    # ---------------

    db.delete(user)
    db.commit()
    
    return {"message": f"User #{user_id} deleted successfully"}


@app.get("/admin/audit-logs", response_model=list[schemas.AuditLogOut])
def get_audit_logs(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access Forbidden")
    
    # Safer Query: Outer Join (in case admin user was deleted but log remains)
    results = db.query(models.AuditLog, models.User)\
                .outerjoin(models.User, models.AuditLog.admin_id == models.User.id)\
                .order_by(models.AuditLog.timestamp.desc())\
                .all()
    
    logs = []
    for log, user in results:
        # Handle case where user is None (e.g. deleted admin)
        admin_name = user.name if user else "Unknown/Deleted Admin"
        
        log_out = schemas.AuditLogOut(
            id=log.id,
            admin_id=log.admin_id,
            action=log.action,
            target_type=log.target_type,
            target_id=log.target_id,
            timestamp=log.timestamp,
            admin_name=admin_name
        )
        logs.append(log_out)
        
    return logs