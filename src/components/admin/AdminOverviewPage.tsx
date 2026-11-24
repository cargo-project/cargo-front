"use client";

import Link from "next/link";
import { Activity, BellRing, Cpu, Database, RefreshCw, Route, ShieldCheck, Users, Workflow } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ApiAdminOverview, ApiIntegrationHealth } from "@/types/api";
import { adminService } from "@/services/adminService";
import { settingsService } from "@/services/settingsService";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDateTime, relativeTime } from "@/utils/format";
import { AdminGuard } from "./AdminGuard";

const RULES = ["ROUTE_DEVIATION", "PROLONGED_STOP", "CONNECTION_LOSS", "DESTINATION_ARRIVAL", "EMERGENCY"] as const;

function Kpi({ icon, label, value, detail, tone = "" }: { icon: React.ReactNode; label: string; value: React.ReactNode; detail: React.ReactNode; tone?: string }) {
  return <div className={`card admin-kpi ${tone}`}><span className="admin-kpi__icon">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></div>;
}

function OverviewContent() {
  const { t } = useLanguage();
  const [data, setData] = useState<ApiAdminOverview>();
  const [health, setHealth] = useState<ApiIntegrationHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const [overview, integrations] = await Promise.all([adminService.overview(), settingsService.health()]); setData(overview); setHealth(integrations); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("admin.loadFailed")); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { void load(); }, [load]);

  const cep = health.find((item) => item.key === "cep");
  const activeAccounts = data?.accounts.filter((account) => account.isActive).length ?? 0;
  const lastAccesses = [...(data?.accounts ?? [])].filter((account) => account.lastLoginAt).sort((a, b) => (b.lastLoginAt ?? "").localeCompare(a.lastLoginAt ?? "")).slice(0, 5);
  const offlineIntegrations = health.filter((item) => item.status === "offline").length;

  return <div className="module-page admin-page">
    <PageHeader title={t("admin.overviewTitle")} subtitle={t("admin.overviewSubtitle")} action={<Button variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw size={16} />{t("admin.refresh")}</Button>} />
    <AsyncState loading={loading && !data} error={error} onRetry={() => void load()} />
    {data && <>
      <div className="admin-kpi-grid">
        <Kpi icon={<Users size={20} />} label={t("admin.kpiAccounts")} value={`${activeAccounts} / ${data.accounts.length}`} detail={t("admin.kpiAccountsDetail")} />
        <Kpi icon={<ShieldCheck size={20} />} label={t("admin.kpiLogins")} value={data.loginsLastDay} detail={`${data.failedLoginsLastDay} ${t("admin.kpiFailed")}`} tone={data.failedLoginsLastDay ? "admin-kpi--warning" : ""} />
        <Kpi icon={<Route size={20} />} label={t("admin.kpiTrips")} value={data.fleet.activeTrips} detail={`${data.fleet.totalTrips} ${t("admin.kpiTripsTotal")}`} />
        <Kpi icon={<Cpu size={20} />} label={t("admin.kpiDevices")} value={`${data.fleet.devicesOnline} / ${data.fleet.devices}`} detail={`${data.fleet.vehicles} ${t("admin.kpiVehicles")} · ${data.fleet.drivers} ${t("admin.kpiDrivers")}`} />
        <Kpi icon={<Activity size={20} />} label={t("admin.kpiTelemetry")} value={data.telemetryLastDay.total} detail={`${data.telemetryLastDay.live} LIVE · ${data.telemetryLastDay.delayed} DELAYED`} />
        <Kpi icon={<BellRing size={20} />} label={t("admin.kpiNotifications")} value={data.notificationsLastDay.sent} detail={`${data.notificationsLastDay.failed} ${t("admin.kpiFailed")} · ${data.notificationsLastDay.pending} ${t("admin.kpiPending")}`} tone={data.notificationsLastDay.failed ? "admin-kpi--warning" : ""} />
      </div>

      <div className="admin-columns">
        <section className="card admin-panel">
          <header><Workflow size={18} /><div><h2>{t("admin.cepTitle")}</h2><p>{t("admin.cepSubtitle")}</p></div><span className={`status-pill status-pill--${cep?.status ?? "offline"}`}><span />{cep ? t(`admin.status.${cep.status}` as never) : "—"}</span></header>
          <table className="admin-table"><thead><tr><th>{t("admin.cepRule")}</th><th>{t("admin.last24h")}</th><th>{t("admin.last7d")}</th></tr></thead>
            <tbody>{RULES.map((rule) => <tr key={rule}><td>{t(`event.${rule}` as never)}</td><td>{data.eventsLastDay[rule] ?? 0}</td><td>{data.eventsLastWeek[rule] ?? 0}</td></tr>)}</tbody></table>
          <dl className="admin-facts">
            <div><dt>{t("admin.cepDelayed")}</dt><dd>{data.delayedEventsLastWeek}</dd></div>
            <div><dt>{t("admin.cepOutbox")}</dt><dd>{data.outboxPending}</dd></div>
            <div><dt>{t("admin.cepRuntime")}</dt><dd>{cep?.detail ?? "—"}</dd></div>
          </dl>
          <p className="admin-note">{t("admin.cepNote")}</p>
        </section>

        <section className="card admin-panel">
          <header><Database size={18} /><div><h2>{t("admin.integrationsTitle")}</h2><p>{offlineIntegrations ? `${offlineIntegrations} ${t("admin.integrationsDown")}` : t("admin.integrationsOk")}</p></div></header>
          <ul className="admin-integrations">{health.map((item) => <li key={item.key}><span className={`admin-dot admin-dot--${item.status}`} /><div><strong>{item.name}</strong><small>{item.detail}</small></div><span className={`status-pill status-pill--${item.status}`}><span />{t(`admin.status.${item.status}` as never)}</span></li>)}</ul>
        </section>
      </div>

      <section className="card admin-panel">
        <header><ShieldCheck size={18} /><div><h2>{t("admin.lastAccessTitle")}</h2><p>{t("admin.lastAccessSubtitle")}</p></div><Link className="text-button" href="/admin/usuarios">{t("admin.manageUsers")}</Link></header>
        {lastAccesses.length === 0 ? <p className="admin-note">{t("admin.noLogins")}</p> :
          <table className="admin-table"><thead><tr><th>{t("admin.user")}</th><th>{t("admin.role")}</th><th>{t("admin.lastLogin")}</th></tr></thead>
            <tbody>{lastAccesses.map((account) => <tr key={account.id}><td><strong>{account.fullName}</strong><small className="cell-subtitle">{account.email}</small></td><td>{t(`admin.roles.${account.role}` as never)}</td><td title={formatDateTime(account.lastLoginAt ?? undefined)}>{relativeTime(account.lastLoginAt ?? undefined)}</td></tr>)}</tbody></table>}
      </section>
      <p className="admin-note">{t("admin.generatedAt")} {formatDateTime(data.generatedAt)}</p>
    </>}
  </div>;
}

export function AdminOverviewPage() { return <AdminGuard><OverviewContent /></AdminGuard>; }
