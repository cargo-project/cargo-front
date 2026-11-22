"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardStats } from "./DashboardStats";
import { FleetMap } from "./FleetMap";
import { RecentActivity } from "./RecentActivity";
import { VehicleList } from "./VehicleList";
import { useLanguage } from "@/i18n/LanguageContext";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardStat, RecentActivityItem } from "@/types/dashboard";
import type { Vehicle } from "@/types/vehicle";
import { AsyncState } from "@/components/ui/AsyncState";
import { useRealtime } from "@/hooks/useRealtime";

export function DashboardClient() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState("");
  const refreshTimer = useRef<number | undefined>(undefined);
  const load = useCallback(async (showLoading: boolean) => {
    if (showLoading) { setLoading(true); setError(""); }
    try {
      const data = await dashboardService.getDashboard();
      setVehicles(data.vehicles); setStats(data.stats); setActivity(data.activity);
      setSelectedId((current) => current || data.vehicles[0]?.id || "");
    } catch (reason) {
      if (showLoading) setError(reason instanceof Error ? reason.message : "No se pudo cargar el tablero.");
    } finally { if (showLoading) setLoading(false); }
  }, []);
  useEffect(() => { void load(true); }, [load]);
  useEffect(() => () => { if (refreshTimer.current) window.clearTimeout(refreshTimer.current); }, []);
  useRealtime((message) => {
    if (!["position.updated", "monitoring.event_created", "trip.status_changed"].includes(message.type)) return;
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => void load(false), 250);
  });
  return <div className="dashboard"><header className="page-heading"><div><span className="eyebrow">{t("dashboard.kicker")}</span><h1>{t("dashboard.title")}</h1><p>{t("dashboard.subtitle")}</p></div><div className="operational-status"><span />{t("dashboard.operational")}</div></header><AsyncState loading={loading} error={error} onRetry={() => void load(true)} />{!loading && !error && <><DashboardStats stats={stats} />{vehicles.length > 0 ? <div className="fleet-grid"><FleetMap vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} /><VehicleList vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} /></div> : <AsyncState loading={false} empty />}<RecentActivity items={activity} /></>}</div>;
}
