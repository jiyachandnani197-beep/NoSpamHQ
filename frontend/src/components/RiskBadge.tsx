import { AlertTriangle, CheckCircle2, CircleAlert, ShieldAlert } from "lucide-react";
import type { RiskLevel } from "@/lib/types";

const tone: Record<RiskLevel, string> = {
  safe: "text-[#21734d]",
  low: "text-[#287b70]",
  suspicious: "text-[#8a681e]",
  high: "text-[#9b3d35]",
  critical: "text-[#8e2821]",
};

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  const Icon = risk === "safe" ? CheckCircle2 : risk === "low" ? ShieldAlert : risk === "suspicious" ? CircleAlert : AlertTriangle;
  const label = ({ safe: "Safe", low: "Low risk", suspicious: "Suspicious", high: "High risk", critical: "Critical" } as Record<RiskLevel, string>)[risk];
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] ${tone[risk]}`} data-testid={`risk-indicator-${risk}`}><Icon className="size-3.5" aria-hidden="true" />{label}</span>;
}