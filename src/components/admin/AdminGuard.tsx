"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

/** Las pantallas de administración solo se muestran al rol ADMIN (el backend también lo exige). */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) return null;
  if (user?.role !== "ADMIN") {
    return <div className="module-page"><div className="card admin-denied"><ShieldAlert size={28} /><h2>{t("admin.deniedTitle")}</h2><p>{t("admin.deniedText")}</p></div></div>;
  }
  return <>{children}</>;
}
