export type ScanType = "email" | "message" | "url" | "attachment";
export type RiskLevel = "safe" | "low" | "suspicious" | "high" | "critical";

export interface User {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  created_at: string;
}

export interface ThreatIndicator {
  id: string;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface Scan {
  id: string;
  scan_type: ScanType;
  target: string;
  risk_score: number;
  risk_level: RiskLevel;
  indicators: ThreatIndicator[];
  summary: string;
  recommendation: string;
  status: "completed";
  created_at: string;
}

export interface AnalyzeRequest {
  scan_type: ScanType;
  target: string;
  metadata?: Record<string, string>;
}

export interface AuthResponse {
  user: User;
}

export const SCAN_TYPES: { value: ScanType; label: string; short: string; description: string }[] = [
  { value: "email", label: "Email", short: "EMAIL", description: "Inspect sender, content, and links." },
  { value: "message", label: "Message", short: "MESSAGE", description: "Check texts for scam patterns." },
  { value: "url", label: "URL", short: "URL", description: "Review a link before you open it." },
  { value: "attachment", label: "Attachment", short: "FILE", description: "Review a file without opening it." },
];

export const riskLabel = (risk: RiskLevel) =>
  ({ safe: "Safe", low: "Low risk", suspicious: "Suspicious", high: "High risk", critical: "Critical" })[risk];