import uuid

def test_demo_email_analysis(client):
    payload = {"scan_type":"email","target":"Urgent: verify your account password at https://security-alert.example.com/login","metadata":{"sender":"security-alert@example.com","subject":"Immediate verification"}}
    r = client.post("/demo/analyze", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["risk_level"] in {"low","suspicious","high","critical"}
    assert data["risk_score"] > 0 and data["indicators"] and data["recommendation"]

def test_demo_all_types(client):
    for scan_type, target, metadata in [
        ("message", "Congratulations, claim your prize now", {}),
        ("url", "https://verify-login-example.com", {}),
        ("attachment", "invoice.exe", {"filename":"invoice.exe"}),
    ]:
        r = client.post("/demo/analyze", json={"scan_type":scan_type,"target":target,"metadata":metadata})
        assert r.status_code == 200, r.text
        assert r.json()["scan_type"] == scan_type
