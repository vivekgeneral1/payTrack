#!/usr/bin/env python3
"""Seeds a demo user with realistic payments, subscriptions, and an invoice via the live API.

Usage:
    python3 scripts/seed_demo_data.py [base_url]

Default base_url: http://localhost:8080
Demo login: demo@paytrack.app / Demo@12345
"""
import json
import sys
import urllib.request
import urllib.error
from datetime import date, timedelta

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
EMAIL = "demo@paytrack.app"
PASSWORD = "Demo@12345"
FULL_NAME = "Demo User"


def call(method, path, token=None, body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        print(f"  ! {method} {path} -> {e.code}: {e.read().decode()[:300]}")
        return None


def get_or_create_token():
    resp = call("POST", "/api/auth/login", body={"email": EMAIL, "password": PASSWORD})
    if resp:
        print(f"Logged in as existing demo user ({EMAIL})")
        return resp["accessToken"]
    resp = call("POST", "/api/auth/signup", body={"email": EMAIL, "password": PASSWORD, "fullName": FULL_NAME})
    if not resp:
        sys.exit("Could not sign up or log in demo user")
    print(f"Created demo user ({EMAIL})")
    return resp["accessToken"]


def iso(d: date) -> str:
    return d.isoformat()


def main():
    token = get_or_create_token()
    today = date.today()

    categories = {c["name"]: c["id"] for c in call("GET", "/api/categories", token)}
    print(f"Found {len(categories)} categories")

    # --- Subscriptions ---
    subs_spec = [
        dict(providerName="Netflix", planName="Premium 4K", cost=649, currency="INR",
             billingCycle="MONTHLY", category="Entertainment",
             startDate=today - timedelta(days=400), nextRenewalDate=today + timedelta(days=5)),
        dict(providerName="Spotify", planName="Family", cost=179, currency="INR",
             billingCycle="MONTHLY", category="Entertainment",
             startDate=today - timedelta(days=200), nextRenewalDate=today + timedelta(days=12)),
        dict(providerName="Amazon Prime", planName="Annual", cost=1499, currency="INR",
             billingCycle="YEARLY", category="Entertainment",
             startDate=today - timedelta(days=100), nextRenewalDate=today + timedelta(days=265)),
        dict(providerName="Google One", planName="2TB", cost=650, currency="INR",
             billingCycle="MONTHLY", category="Utilities",
             startDate=today - timedelta(days=60), nextRenewalDate=today + timedelta(days=2)),
        dict(providerName="Gym Membership", planName="Gold", cost=1800, currency="INR",
             billingCycle="MONTHLY", category="Other",
             startDate=today - timedelta(days=500), nextRenewalDate=today + timedelta(days=20)),
    ]

    sub_ids = {}
    print("Creating subscriptions...")
    for s in subs_spec:
        payload = {
            "categoryId": categories.get(s["category"]),
            "providerName": s["providerName"],
            "planName": s["planName"],
            "cost": s["cost"],
            "currency": s["currency"],
            "billingCycle": s["billingCycle"],
            "customIntervalDays": None,
            "startDate": iso(s["startDate"]),
            "nextRenewalDate": iso(s["nextRenewalDate"]),
            "autoRenew": True,
            "cancellationUrl": None,
            "cancellationInstructions": None,
        }
        created = call("POST", "/api/subscriptions", token, payload)
        if created:
            sub_ids[s["providerName"]] = created["id"]
            print(f"  + {s['providerName']} ({s['billingCycle']}, {s['currency']} {s['cost']})")

    # Cancel one subscription to populate cancellation history
    if "Gym Membership" in sub_ids:
        call("POST", f"/api/subscriptions/{sub_ids['Gym Membership']}/cancel", token,
             {"reason": "Switched to home workouts", "effectiveDate": iso(today + timedelta(days=5)),
              "refundAmount": None, "notes": "Seeded demo cancellation"})
        print("  x Cancelled Gym Membership (demo history)")

    # --- Standalone / recurring payments ---
    payments_spec = [
        dict(title="Electricity Bill", amount=2140, currency="INR", category="Utilities",
             dueDate=today - timedelta(days=10), mark_paid=True),
        dict(title="Internet (Broadband)", amount=999, currency="INR", category="Utilities",
             dueDate=today - timedelta(days=3), mark_paid=True),
        dict(title="House Rent", amount=25000, currency="INR", category="Rent & Housing",
             dueDate=today + timedelta(days=1), mark_paid=False),
        dict(title="Car Insurance Premium", amount=8450, currency="INR", category="Insurance",
             dueDate=today + timedelta(days=15), mark_paid=False),
        dict(title="Credit Card EMI", amount=5600, currency="INR", category="Loans & EMI",
             dueDate=today - timedelta(days=20), mark_paid=False),  # left unpaid -> overdue
        dict(title="Mobile Recharge", amount=399, currency="INR", category="Utilities",
             dueDate=today - timedelta(days=1), mark_paid=True),
        dict(title="Netflix - Premium 4K", amount=649, currency="INR", category="Entertainment",
             dueDate=today + timedelta(days=5), mark_paid=False, subscription="Netflix"),
        dict(title="Spotify - Family", amount=179, currency="INR", category="Entertainment",
             dueDate=today - timedelta(days=18), mark_paid=True, subscription="Spotify"),
    ]

    created_payment_ids = []
    print("Creating payments...")
    for p in payments_spec:
        payload = {
            "categoryId": categories.get(p["category"]),
            "subscriptionId": sub_ids.get(p.get("subscription")),
            "title": p["title"],
            "amount": p["amount"],
            "currency": p["currency"],
            "dueDate": iso(p["dueDate"]),
            "recurring": "subscription" in p,
            "recurrenceRule": None,
            "notes": "Seeded demo payment",
        }
        created = call("POST", "/api/payments", token, payload)
        if not created:
            continue
        created_payment_ids.append((created["id"], p["title"]))
        status = "pending"
        if p["mark_paid"]:
            call("POST", f"/api/payments/{created['id']}/mark-paid", token)
            status = "paid"
        print(f"  + {p['title']} (due {iso(p['dueDate'])}, {status})")

    # --- Invoice upload (attach to the first paid payment) ---
    paid_for_invoice = next((pid for pid, title in created_payment_ids if title == "Electricity Bill"), None)
    if paid_for_invoice:
        print("Uploading a sample invoice PDF...")
        upload_invoice(token, paid_for_invoice)

    print("\nDone. Login with:")
    print(f"  email:    {EMAIL}")
    print(f"  password: {PASSWORD}")


def upload_invoice(token, payment_id):
    import subprocess
    pdf_bytes = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n"
        b"xref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF"
    )
    tmp_path = "/tmp/paytrack-demo-invoice.pdf"
    with open(tmp_path, "wb") as f:
        f.write(pdf_bytes)
    cmd = [
        "curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
        "-X", "POST", f"{BASE_URL}/api/invoices",
        "-H", f"Authorization: Bearer {token}",
        "-F", f"file=@{tmp_path};type=application/pdf",
        "-F", f"paymentId={payment_id}",
        "-F", "invoiceNumber=INV-DEMO-0001",
        "-F", f"invoiceDate={date.today().isoformat()}",
        "-F", "amount=2140",
        "-F", "vendorName=State Electricity Board",
    ]
    code = subprocess.run(cmd, capture_output=True, text=True).stdout
    print(f"  + invoice upload -> HTTP {code}")


if __name__ == "__main__":
    main()
