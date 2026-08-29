import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import MarketingShell from "@/components/MarketingShell";
import AppShell from "@/components/AppShell";
import { fetchSession } from "@/lib/session";
import type { User } from "@/lib/types";
import Home from "@/pages/Home";
import Demo from "@/pages/Demo";
import HowItWorks from "@/pages/HowItWorks";
import Security from "@/pages/Security";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Scanner from "@/pages/Scanner";
import Result from "@/pages/Result";
import History from "@/pages/History";
import Settings from "@/pages/Settings";

function Public({ children }: { children: ReactNode }) { return <MarketingShell>{children}</MarketingShell>; }

function Protected({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery({ queryKey: ["session"], queryFn: fetchSession, retry: false });
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-[#f7fafc] text-sm text-[#8fa2ad]" data-testid="auth-loading">Checking workspace session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell user={user as User}>{children}</AppShell>;
}

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Public><Home /></Public>} />
      <Route path="/demo" element={<Public><Demo /></Public>} />
      <Route path="/how-it-works" element={<Public><HowItWorks /></Public>} />
      <Route path="/security" element={<Public><Security /></Public>} />
      <Route path="/pricing" element={<Public><Pricing /></Public>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/scan/:type" element={<Protected><Scanner /></Protected>} />
      <Route path="/result/:id" element={<Protected><Result /></Protected>} />
      <Route path="/history" element={<Protected><History /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
