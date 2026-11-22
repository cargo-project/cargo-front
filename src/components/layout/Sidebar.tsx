"use client";

import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "./navItems";
import { useLanguage } from "@/i18n/LanguageContext";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(sessionStorage.getItem("cargo-sidebar-collapsed") === "true");
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
    sessionStorage.setItem("cargo-sidebar-collapsed", String(next));
  };

  const activeHref = NAV_ITEMS
    .filter(({ href }) => pathname === href || (href !== "/home" && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isActive = (href: string) => activeHref === href;

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "is-visible" : ""}`} onClick={onMobileClose} aria-hidden="true" />
      <aside className={`sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`} aria-label="Navegación principal">
        <div className="sidebar__brand">
          <Link href="/home" onClick={onMobileClose} className="brand-mark" aria-label="CarGO"><span className="brand-icon">C</span><span className="brand-copy"><strong>Car<span>GO</span></strong><small>{t("app.fleetManagement")}</small></span></Link>
          <button className="icon-button sidebar__mobile-close" onClick={onMobileClose} aria-label={t("app.closeMenu")}><X size={20} /></button>
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ labelKey, href, icon: Icon }) => (
            <Link key={href} href={href} onClick={onMobileClose} className={`nav-item ${isActive(href) ? "is-active" : ""}`} title={collapsed ? t(labelKey) : undefined} aria-current={isActive(href) ? "page" : undefined}>
              <Icon size={20} aria-hidden="true" /><span>{t(labelKey)}</span>
            </Link>
          ))}
        </nav>
        <button className="sidebar__toggle" onClick={toggle} aria-label={collapsed ? t("app.expand") : t("app.collapse")} title={collapsed ? t("app.expand") : undefined}>
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}<span>{t("app.collapse")}</span>
        </button>
      </aside>
    </>
  );
}
