import re
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, Response, status
from passlib.context import CryptContext

from lib.dates import today_iso
from models.security import (
    AnalyzeRequest,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    Scan,
    ScanType,
    ThreatIndicator,
    User,
)


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SESSION_COOKIE = "nsh_session"
SESSION_MAX_AGE = 60 * 60 * 24 * 14

# Deliberately in-memory for the first MVP. The interfaces are kept behind this router
# so the storage can be replaced with a database without changing the frontend contract.
_users_by_email: dict[str, dict] = {}
_users_by_id: dict[str, dict] = {}
_passwords_by_email: dict[str, str] = {}
_sessions: dict[str, str] = {}
_scans_by_user: dict[str, list[dict]] = {}


def _set_session(response: Response, user_id: str) -> None:
    token = secrets.token_urlsafe(32)
    _sessions[token] = user_id
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,
    )


def _current_user(request: Request) -> User | None:
    token = request.cookies.get(SESSION_COOKIE)
    user_id = _sessions.get(token or "")
    user = _users_by_id.get(user_id or "")
    return User(**user) if user else None


def _require_user(request: Request) -> User:
    user = _current_user(request)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def _scan_from_record(record: dict) -> Scan:
    return Scan(**{key: value for key, value in record.items() if key != "user_id"})


def _indicator(indicator_id: str, title: str, detail: str, severity: str) -> ThreatIndicator:
    return ThreatIndicator(id=indicator_id, title=title, detail=detail, severity=severity)  # type: ignore[arg-type]


def _build_analysis(payload: AnalyzeRequest) -> Scan:
    combined = " ".join([payload.target, *payload.metadata.values()]).lower()
    indicators: list[ThreatIndicator] = []

    urgency_terms = ("urgent", "immediately", "act now", "expires", "verify", "flagged")
    credential_terms = ("password", "credentials", "login", "sign in", "account", "verification")
    if any(term in combined for term in urgency_terms):
        indicators.append(_indicator("urgency", "Urgency-based language", "The content pressures the recipient to act before reviewing the request.", "medium"))
    if any(term in combined for term in credential_terms):
        indicators.append(_indicator("credential", "Credential harvesting pattern", "The wording requests account access or directs the recipient toward a sign-in action.", "high"))
    if "http://" in combined or "https://" in combined or "click here" in combined:
        indicators.append(_indicator("link", "Suspicious link behavior", "A link or click instruction is present and should be inspected before opening.", "high"))
    if payload.scan_type == "email" and ("@example.com" in combined or "security-alert" in combined):
        indicators.append(_indicator("sender", "Sender reputation requires review", "The sender identity does not provide enough trust signals for this request.", "medium"))
    if payload.scan_type == "message" and any(term in combined for term in ("won", "reward", "prize", "congratulations", "claim")):
        indicators.append(_indicator("social", "Reward scam pattern", "The message uses an unexpected reward to encourage a risky next step.", "high"))
    if payload.scan_type == "url":
        host_match = re.search(r"https?://([^/]+)", payload.target.lower())
        if host_match and ("-" in host_match.group(1) or "verify" in payload.target.lower() or "login" in payload.target.lower()):
            indicators.append(_indicator("domain", "Domain and path anomaly", "The domain or path uses patterns commonly associated with impersonation pages.", "high"))
    if payload.scan_type == "attachment":
        filename = payload.metadata.get("filename", payload.target).lower()
        if filename.endswith((".zip", ".exe", ".js", ".scr", ".docm", ".xlsm")) or "macro" in combined:
            indicators.append(_indicator("file", "Attachment type requires caution", "This file type can contain active content or conceal additional payloads.", "high"))

    indicators = indicators[:4]
    score = min(100, 18 + len(indicators) * 18)
    if any(item.id in {"credential", "link", "file", "domain"} for item in indicators):
        score = min(100, score + 12)
    if len(indicators) >= 4:
        score = 87

    risk_level = "safe" if score < 35 else "low" if score < 60 else "suspicious" if score < 80 else "high" if score < 95 else "critical"
    if indicators:
        summary = f"{len(indicators)} signal{'s' if len(indicators) != 1 else ''} contributed to this assessment. Review the indicators before interacting with the content."
        recommendation = "Do not click links, open attachments, or provide credentials until the source is independently verified."
    else:
        summary = "No strong threat signals were found in the submitted content. Continue to use normal verification practices."
        recommendation = "The content appears low risk, but verify unexpected requests through a trusted channel."

    return Scan(
        scan_type=payload.scan_type,
        target=payload.target,
        risk_score=score,
        risk_level=risk_level,  # type: ignore[arg-type]
        indicators=indicators,
        summary=summary,
        recommendation=recommendation,
        created_at=datetime.now(timezone.utc),
    )


@router.post("/demo/analyze", response_model=Scan)
async def analyze_demo(payload: AnalyzeRequest):
    return _build_analysis(payload)


@router.post("/auth/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.strip().lower()
    if email in _users_by_email:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(full_name=payload.full_name.strip(), email=email, company=payload.company or None)
    record = user.model_dump()
    _users_by_email[email] = record
    _users_by_id[user.id] = record
    _passwords_by_email[email] = pwd_context.hash(payload.password)
    _scans_by_user[user.id] = []
    _set_session(response, user.id)
    return AuthResponse(user=user)


@router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest, response: Response):
    email = payload.email.strip().lower()
    password_hash = _passwords_by_email.get(email)
    if not password_hash or not pwd_context.verify(payload.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = User(**_users_by_email[email])
    _set_session(response, user.id)
    return AuthResponse(user=user)


@router.get("/auth/me", response_model=User | None)
async def me(request: Request):
    return _current_user(request)


@router.post("/auth/logout", status_code=204)
async def logout(request: Request, response: Response):
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        _sessions.pop(token, None)
    response.delete_cookie(SESSION_COOKIE)


@router.post("/scans", response_model=Scan)
async def create_scan(payload: AnalyzeRequest, request: Request):
    user = _require_user(request)
    scan = _build_analysis(payload)
    record = scan.model_dump()
    record["user_id"] = user.id
    _scans_by_user.setdefault(user.id, []).insert(0, record)
    return scan


@router.get("/scans", response_model=list[Scan])
async def list_scans(request: Request):
    user = _require_user(request)
    return [_scan_from_record(record) for record in _scans_by_user.get(user.id, [])]


@router.get("/scans/{scan_id}", response_model=Scan)
async def get_scan(scan_id: str, request: Request):
    user = _require_user(request)
    record = next((item for item in _scans_by_user.get(user.id, []) if item["id"] == scan_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return _scan_from_record(record)
