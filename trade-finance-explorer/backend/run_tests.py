import requests
import json
import sys
import time

# --- CONFIGURATION ---
BASE_URL = "http://127.0.0.1:8000"
RED = "\033[91m"
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def print_pass(message):
    print(f"{GREEN}✔ PASS:{RESET} {message}")

def print_fail(message):
    print(f"{RED}✘ FAIL:{RESET} {message}")
    sys.exit(1)

def print_section(title):
    print(f"\n{CYAN}{'='*60}\n{title}\n{'='*60}{RESET}")

def register_and_login(email, password, name, role="bank"):
    # 1. Register (ignore 400 if already exists)
    payload = {"email": email, "password": password, "name": name, "role": role, "org_name": "TestCorp"}
    try:
        requests.post(f"{BASE_URL}/register", json=payload)
    except:
        pass # User might already exist
    
    # 2. Login
    resp = requests.post(f"{BASE_URL}/login", data={"username": email, "password": password})
    if resp.status_code != 200:
        print_fail(f"Login failed for {email}. Server responded: {resp.status_code}")
    
    return resp.json()["access_token"]

def run_full_system_check():
    print(f"\n{YELLOW} STARTING SYSTEM DIAGNOSTICS (TEST CASES 1-4){RESET}")

    # ==============================================================================
    # TEST CASE 1: AUTHENTICATION & IDENTITY
    # ==============================================================================
    print_section("TEST CASE 1: Authentication & Identity")
    
    print("   Creating User A (Alice - Exporter)...")
    token_alice = register_and_login("alice_sys@test.com", "pass123", "Alice Exporter")
    headers_alice = {"Authorization": f"Bearer {token_alice}"}
    print_pass("Alice successfully authenticated.")

    print("   Creating User B (Bob - Importer)...")
    token_bob = register_and_login("bob_sys@test.com", "pass123", "Bob Importer")
    headers_bob = {"Authorization": f"Bearer {token_bob}"}
    print_pass("Bob successfully authenticated.")

    # ==============================================================================
    # TEST CASE 2: DOCUMENT HASHING & TAMPER PROOFING
    # ==============================================================================
    print_section("TEST CASE 2: Document Integrity (Hashing)")

    # Upload Original
    files = {'file': ('contract_v1.pdf', b'This is a 10 million dollar contract.')}
    data = {'doc_type': 'INVOICE', 'doc_number': 'INV-SYS-001', 'issued_at': '2023-01-01T00:00:00'}
    
    print("   Alice uploading original document...")
    resp = requests.post(f"{BASE_URL}/documents/upload", headers=headers_alice, files=files, data=data)
    if resp.status_code != 200: print_fail(f"Upload failed: {resp.text}")
    
    doc_data = resp.json()
    doc_id = doc_data['id']
    original_hash = doc_data['hash']
    print(f"   Document #{doc_id} created. Hash: {original_hash[:15]}...")

    # Upload Modified (Tampered)
    files_tampered = {'file': ('contract_v1.pdf', b'This is a 00 million dollar contract.')}
    print("   Alice uploading modified document (simulating tamper)...")
    resp = requests.post(f"{BASE_URL}/documents/upload", headers=headers_alice, files=files_tampered, data=data)
    tampered_hash = resp.json()['hash']
    print(f"   Modified Hash: {tampered_hash[:15]}...")

    if original_hash != tampered_hash:
        print_pass("System correctly generated unique hashes for different content.")
    else:
        print_fail("Hashing algorithm failed! Different content produced same hash.")

   
if __name__ == "__main__":
    try:
        run_full_system_check()
    except requests.exceptions.ConnectionError:
        print_fail("Could not connect to server. Ensure 'uvicorn main:app' is running.")