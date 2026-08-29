from datetime import datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field, model_validator


ScanType = Literal["email", "message", "url", "attachment"]
RiskLevel = Literal["safe", "low", "suspicious", "high", "critical"]


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    full_name: str
    email: str
    company: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now().astimezone())


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)
    company: str | None = Field(default=None, max_length=160)

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    email: str
    password: str


class ThreatIndicator(BaseModel):
    id: str
    title: str
    detail: str
    severity: Literal["low", "medium", "high"]


class AnalyzeRequest(BaseModel):
    scan_type: ScanType
    target: str = Field(min_length=1, max_length=30000)
    metadata: dict[str, str] = Field(default_factory=dict)


class Scan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    scan_type: ScanType
    target: str
    risk_score: int = Field(ge=0, le=100)
    risk_level: RiskLevel
    indicators: list[ThreatIndicator]
    summary: str
    recommendation: str
    status: Literal["completed"] = "completed"
    created_at: datetime = Field(default_factory=lambda: datetime.now().astimezone())


class AuthResponse(BaseModel):
    user: User
