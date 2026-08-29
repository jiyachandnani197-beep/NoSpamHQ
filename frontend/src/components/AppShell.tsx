import { useMutation } from "@tanstack/react-query";
import { History, LayoutDashboard, Link2, LogOut, Menu, MessageSquareText, Settings, ShieldCheck, X, Mail, Paperclip } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Brand from "@/components/Brand";
import GoogleGmailTab from "@/components/GoogleGmailTab";
import { endSession } from "@/lib/session";
import type { User } from "@/lib/types";

const scanLinks = [
  ["/scan/email", "Scan Email", Mail],
  ["/scan/message", "Scan Message", MessageSquareText],
  ["/scan/url", "Scan URL", Link2],
  ["/scan/attachment", "Scan Attachment", Paperclip],
] as const;

export default function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logout = useMutation({ mutationFn: () => endSession(), onSuccess: () => navigate("/login") });
  const navClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 border-l-2 px-3 py-2.5 text-[13px] font-semibold transition ${isActive ? "border-[#0fb7b5] bg-[#0b304b] text-white" : "border-transparent text-[#9db5c2] hover:bg-[#0b304b]/70 hover:text-white"}`;
  const sidebar = (
    <aside className="flex h-full w-[246px] shrink-0 flex-col bg-[#061827] text-white" data-testid="app-sidebar">
      <div className="flex h-[80px] items-center border-b border-white/10 px-6"><Brand inverse /></div>
      <div className="px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#587585]" data-testid="sidebar-workspace-label">Workspace</p>
        <nav className="grid gap-1" data-testid="sidebar-primary-nav">
          <NavLink to="/dashboard" className={navClass} data-testid="sidebar-dashboard-link"><LayoutDashboard className="size-4" />Dashboard</NavLink>
          {scanLinks.map(([href, label, Icon]) => <NavLink key={href} to={href} className={navClass} onClick={() => setMobileOpen(false)} data-testid={`sidebar-${label.toLowerCase().replaceAll(" ", "-")}-link`}><Icon className="size-4" />{label}</NavLink>)}
          <NavLink to="/history" className={navClass} data-testid="sidebar-history-link"><History className="size-4" />Scan History</NavLink>
        </nav>
        <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#587585]" data-testid="sidebar-account-label">Account</p>
        <nav className="grid gap-1">
          <NavLink to="/settings" className={navClass} data-testid="sidebar-settings-link"><Settings className="size-4" />Settings</NavLink>
        </nav>
      </div>
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-[7px] bg-white/5 p-3" data-testid="sidebar-user-summary">
          <div className="grid size-8 place-items-center rounded-full bg-[#0fb7b5] text-xs font-extrabold text-[#061827]" data-testid="sidebar-user-initials">{user.full_name.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0"><p className="truncate text-xs font-bold text-white" data-testid="sidebar-user-name">{user.full_name}</p><p className="truncate text-[11px] text-[#9db5c2]" data-testid="sidebar-user-email">{user.email}</p></div>
        </div>
        <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending} className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold text-[#9db5c2] transition hover:text-white" data-testid="sidebar-sign-out-button"><LogOut className="size-4" />{logout.isPending ? "Signing out…" : "Sign Out"}</button>
      </div>
    </aside>
  );
  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#061827]" data-testid="app-shell">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex">{sidebar}</div>
        {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button type="button" className="flex-1 bg-[#061827]/60" onClick={() => setMobileOpen(false)} data-testid="mobile-sidebar-overlay" aria-label="Close sidebar" />{sidebar}<button type="button" className="absolute left-[254px] top-5 grid size-9 place-items-center rounded bg-white" onClick={() => setMobileOpen(false)} data-testid="mobile-sidebar-close"><X className="size-4" /></button></div>}
        <main className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-[#dce5ea] bg-white px-5 lg:px-9" data-testid="app-topbar">
            <button type="button" className="grid size-9 place-items-center rounded-[7px] border border-[#dce5ea] lg:hidden" onClick={() => setMobileOpen(true)} data-testid="mobile-sidebar-open"><Menu className="size-4" /></button>
            <div className="hidden items-center gap-2 text-xs text-[#8fa2ad] lg:flex" data-testid="topbar-breadcrumb"><ShieldCheck className="size-4 text-[#087f82]" />Private analysis workspace</div>
            <Link to="/settings" className="flex items-center gap-2.5" data-testid="topbar-profile-link"><span className="grid size-8 place-items-center rounded-full bg-[#d9f4f1] text-xs font-extrabold text-[#087f82]">{user.full_name.slice(0, 1).toUpperCase()}</span><span className="hidden text-xs font-bold text-[#26343d] sm:inline" data-testid="topbar-user-name">{user.full_name}</span></Link>
          </header>
          <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-9 lg:py-10">{children}</div>
        </main>
      </div>
      {(pathname === "/dashboard" || pathname.startsWith("/scan/")) && <GoogleGmailTab />}
    </div>
  );
}