import uuid

def register(client):
    email = f"tscheck-auth-{uuid.uuid4().hex[:10]}@example.test"
    r = client.post("/auth/register", json={"full_name":"TS Check User","email":email,"password":"StrongPass123!","confirm_password":"StrongPass123!","company":"QA","terms_accepted":True})
    assert r.status_code == 200, r.text
    return email, r.json()["user"]

def test_registration_session_and_protected_scan(client):
    email, user = register(client)
    assert user["email"] == email
    assert client.get("/auth/me").json()["email"] == email
    scan = client.post("/scans", json={"scan_type":"url","target":"https://verify-login-example.com/account","metadata":{}})
    assert scan.status_code == 200, scan.text
    data = scan.json()
    assert data["id"] and data["risk_score"] and data["indicators"] and data["recommendation"]
    listed = client.get("/scans")
    assert listed.status_code == 200 and any(row["id"] == data["id"] for row in listed.json())
    reopened = client.get(f"/scans/{data['id']}")
    assert reopened.status_code == 200 and reopened.json()["id"] == data["id"]

def test_protected_scan_rejects_anonymous(client):
    assert client.post("/scans", json={"scan_type":"email","target":"hello","metadata":{}}).status_code == 401

def test_logout_clears_session(client):
    register(client)
    assert client.post("/auth/logout").status_code == 204
    assert client.get("/auth/me").json() is None
    assert client.get("/scans").status_code == 401
