import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "@/lib/api";
import ResultReport from "@/components/ResultReport";
import type { Scan } from "@/lib/types";

export default function Result() {
  const { id = "" } = useParams(); const { data: scan, isLoading, isError } = useQuery({ queryKey: ["scan", id], queryFn: () => apiGet<Scan>(`/scans/${id}`), enabled: Boolean(id), retry: false });
  if (isLoading) return <main className="py-16" data-testid="result-loading"><div className="h-5 w-40 animate-pulse bg-[#dce5ea]" /><div className="mt-4 h-10 w-80 animate-pulse bg-[#dce5ea]" /><p className="mt-5 text-sm text-[#8fa2ad]">Loading analysis report…</p></main>;
  if (isError || !scan) return <main className="py-16" data-testid="result-error"><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b3d35]">Report unavailable</p><h1 className="mt-3 text-3xl font-extrabold">This scan could not be found.</h1><p className="mt-3 text-sm text-[#52636d]">It may have expired or belong to another workspace.</p><Link to="/dashboard" className="mt-6 inline-flex rounded-[6px] bg-[#087ea4] px-4 py-2.5 text-xs font-extrabold text-white" data-testid="result-error-dashboard-link">Back to dashboard</Link></main>;
  return <ResultReport scan={scan} />;
}