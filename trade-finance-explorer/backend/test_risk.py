import requests
import json
import sys

# CONFIG
BASE_URL = "http://127.0.0.1:8000"
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

def print_pass(msg): print(f"{GREEN}✔ PASS:{RESET} {msg}")
def print_fail(msg): print(f"{RED}✘ FAIL:{RESET} {msg}"); sys.exit(1)

def run_risk_test():
    print(f"\n STARTING RISK ENGINE DIAGNOSTICS...\n")

    # 1. Login
    resp = requests.post(f"{BASE_URL}/login", data={"username": "admin@bank.com", "password": "password123"})
    if resp.status_code != 200:
        # Try registering if login fails
        requests.post(f"{BASE_URL}/register", json={"email": "admin@bank.com", "password": "password123", "name": "Admin", "role": "admin", "org_name": "Bank HQ"})
        resp = requests.post(f"{BASE_URL}/login", data={"username": "admin@bank.com", "password": "password123"})
    
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a "High Risk" Transaction (> $1,000,000)
    print("   Simulating $2,500,000 Trade (High Risk)...")
    trade_payload = {
        "buyer_email": "importer@offshore.com", # Ensure this user exists or use a known one
        "amount": 2500000, 
        "currency": "USD"
    }
    # Create dummy buyer if needed
    try: requests.post(f"{BASE_URL}/register", json={"email": "importer@offshore.com", "password": "pass", "name": "Imp", "role": "corporate", "org_name": "Offshore"})
    except: pass

    resp = requests.post(f"{BASE_URL}/transactions", headers=headers, json=trade_payload)
    if resp.status_code != 200: print_fail(f"Trade creation failed: {resp.text}")
    trade_id = resp.json()['id']

    # 3. Ask Risk Engine to Assess
    print(f"   Requesting Risk Assessment for Trade #{trade_id}...")
    resp = requests.post(f"{BASE_URL}/risk/assess/{trade_id}", headers=headers)
    analysis = resp.json()

    # 4. Verify Logic
    score = analysis['risk_score']
    level = analysis['risk_level']
    flags = analysis['flags']

    print(f"   [AI REPORT] Score: {score}/100 | Level: {level}")
    print(f"   [FLAGS] {flags}")

    if level == "HIGH" and score >= 50:
        print_pass("Risk Engine correctly flagged high-value trade.")
    else:
        print_fail(f"Risk Engine failed. Expected HIGH, got {level}")

    print(f"\n{GREEN}✅ RISK MODULE OPERATIONAL{RESET}\n")

if __name__ == "__main__":
    run_risk_test()

