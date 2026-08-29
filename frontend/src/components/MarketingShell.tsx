import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import Brand from "@/components/Brand";

const links = [
  ["/", "Home"],
  ["/demo", "Demo"],
  ["/how-it-works", "How It Works"],
  ["/security", "Security"],
  ["/pricing", "Pricing"],
] as const;

export default function MarketingShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#061827]" data-testid="marketing-shell">
      <header className="sticky top-0 z-40 border-b border-[#dce5ea] bg-[#f7fafc]/95 backdrop-blur" data-testid="marketing-header">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 lg:flex" data-testid="desktop-marketing-nav">
            {links.map(([href, label]) => (
              <NavLink key={href} to={href} className={({ isActive }) => `text-[13px] font-semibold transition-colors ${isActive ? "text-[#087f82]" : "text-[#52636d] hover:text-[#061827]"}`} data-testid={`marketing-nav-${label.toLowerCase().replaceAll(" ", "-")}-link`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-5 lg:flex" data-testid="marketing-auth-actions">
            <Link to="/login" className="text-[13px] font-bold text-[#52636d] hover:text-[#061827]" data-testid="marketing-sign-in-link">Sign In</Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-[7px] bg-[#087ea4] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#075985]" data-testid="marketing-get-started-link">
              Get Started <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <button type="button" className="grid size-10 place-items-center rounded-[7px] border border-[#dce5ea] bg-white lg:hidden" onClick={() => setOpen((value) => !value)} data-testid="marketing-menu-toggle" aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-[#dce5ea] bg-white px-5 py-4 lg:hidden" data-testid="mobile-marketing-nav">
            <nav className="grid gap-1">
              {links.map(([href, label]) => <NavLink key={href} to={href} onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-semibold text-[#52636d]" data-testid={`mobile-nav-${label.toLowerCase().replaceAll(" ", "-")}-link`}>{label}</NavLink>)}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#eef3f6] pt-3">
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-[7px] border border-[#dce5ea] px-3 py-2.5 text-center text-sm font-bold" data-testid="mobile-sign-in-link">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-[7px] bg-[#087ea4] px-3 py-2.5 text-center text-sm font-bold text-white" data-testid="mobile-get-started-link">Get Started</Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      {children}
      <footer className="border-t border-[#dce5ea] bg-white" data-testid="marketing-footer">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-8 text-xs text-[#8fa2ad] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3"><Brand compact /><span data-testid="footer-tagline">Detect threats before they reach you.</span></div>
          <span data-testid="footer-legal-copy">NoSpamHQ · Analysis designed with privacy principles in mind.</span>
        </div>
      </footer>
    </div>
  );
}