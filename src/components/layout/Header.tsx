"use client";

import { Bell, ChevronDown, Globe2, LogOut, Menu, Search, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "next/navigation";
import { alertService } from "@/services/alertService";
import type { MonitoringEvent } from "@/types/domain";
import { useRealtime } from "@/hooks/useRealtime";

export function Header({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<MonitoringEvent[]>([]);
  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);
  const closeUser = useCallback(() => setUserOpen(false), []);
  const loadAlerts = useCallback(async () => { try { setAlerts((await alertService.getAlerts()).slice(0, 5)); } catch { setAlerts([]); } }, []);
  useEffect(() => { void loadAlerts(); }, [loadAlerts]);
  useRealtime((message) => { if (message.type === "monitoring.event_created") void loadAlerts(); });
  const unread = alerts.filter((item) => item.status === "pending").length;
  const initials = user?.fullName.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() ?? "CG";
  const handleLogout = async () => { await logout(); router.replace("/"); };

  return (
    <header className="header">
      <button className="icon-button header__menu" onClick={onMenuOpen} aria-label={t("app.openMenu")}><Menu size={22} /></button>
      <label className="search-box"><Search size={19} aria-hidden="true" /><input type="search" placeholder={t("header.search")} aria-label={t("common.search")} /></label>
      <div className="header__actions">
        <div className="dropdown-wrap">
          <button className="language-button" onClick={() => { setLanguageOpen((v) => !v); setNotificationsOpen(false); setUserOpen(false); }} aria-label={t("header.language")} aria-expanded={languageOpen}><Globe2 size={18} /><span>{language.toUpperCase()}</span><ChevronDown size={14} /></button>
          <Dropdown isOpen={languageOpen} onClose={() => setLanguageOpen(false)} className="language-dropdown"><button className={language === "es" ? "is-active" : ""} onClick={() => { setLanguage("es"); setLanguageOpen(false); }} role="menuitem">ES · Español</button><button className={language === "en" ? "is-active" : ""} onClick={() => { setLanguage("en"); setLanguageOpen(false); }} role="menuitem">EN · English</button></Dropdown>
        </div>
        <div className="dropdown-wrap">
          <button className="icon-button notification-button" onClick={() => { setNotificationsOpen((v) => !v); setUserOpen(false); }} aria-label={`${unread} notificaciones pendientes`} aria-expanded={notificationsOpen}>
            <Bell size={20} />{unread > 0 && <span className="notification-badge">{unread}</span>}
          </button>
          <Dropdown isOpen={notificationsOpen} onClose={closeNotifications} className="notifications-dropdown">
            <div className="dropdown__heading"><strong>{t("header.notifications")}</strong><span>{unread} {t("header.new")}</span></div>
            {alerts.length === 0 ? <div className="async-state">{language === "es" ? "Sin notificaciones pendientes" : "No pending notifications"}</div> : alerts.map((item) => <button key={item.id} className={`notification-item ${item.status === "pending" ? "is-unread" : ""}`} role="menuitem" onClick={() => { router.push("/alertas"); setNotificationsOpen(false); }}><span className="notification-dot" /><span><strong>{t(`event.${item.type}` as never)}</strong><small>{item.vehicleId} · {item.tripId}</small><time>{item.date}</time></span></button>)}
          </Dropdown>
        </div>
        <div className="dropdown-wrap">
          <button className="user-button" onClick={() => { setUserOpen((v) => !v); setNotificationsOpen(false); }} aria-expanded={userOpen}>
            <span className="avatar" aria-hidden="true">{initials}</span><span className="user-copy"><strong>{user?.fullName}</strong><small>{user?.role === "ADMIN" ? "Administrador" : "Operador"}</small></span><ChevronDown size={16} />
          </button>
          <Dropdown isOpen={userOpen} onClose={closeUser} className="user-dropdown">
            <button role="menuitem"><UserRound size={17} />{t("header.profile")}</button><button role="menuitem" onClick={() => void handleLogout()}><LogOut size={17} />{t("header.logout")}</button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
