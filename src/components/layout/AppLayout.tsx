"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";
export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setCollapsed(sessionStorage.getItem("cargo-sidebar-collapsed") === "true"), []);
  useEffect(() => {
    if (!loading && pathname !== "/" && !user) router.replace("/");
    if (!loading && pathname === "/" && user) router.replace("/home");
  }, [loading, pathname, router, user]);
  if (pathname === "/") return <main className="auth-main">{children}</main>;
  if (loading || !user) return <main className="auth-main"><div className="card async-state">Cargando sesión…</div></main>;
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}><Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} onCollapsedChange={setCollapsed} /><div className="app-main"><Header onMenuOpen={() => setMobileOpen(true)} /><main className="content">{children}</main></div></div>;
}
