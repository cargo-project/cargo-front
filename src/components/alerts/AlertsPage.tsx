"use client";
import { CheckCircle2, MapPin, RadioTower } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MonitoringEvent } from "@/types/domain";
import { alertService } from "@/services/alertService";
import { useRealtime } from "@/hooks/useRealtime";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Select } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowActions } from "@/components/ui/Actions";

export function AlertsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<MonitoringEvent[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [search, setSearch] = useState(""); const [type, setType] = useState("all"); const [status, setStatus] = useState("all"); const [selected, setSelected] = useState<MonitoringEvent | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await alertService.getAlerts()); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar las alertas."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  useRealtime((message) => { if (message.type === "monitoring.event_created") void load(); });
  const filtered = useMemo(() => items.filter((item) => (type === "all" || item.type === type) && (status === "all" || item.status === status) && `${item.vehicleId} ${item.tripId}`.toLowerCase().includes(search.toLowerCase())), [items, search, type, status]);
  const columns: TableColumn<MonitoringEvent>[] = [{ key: "type", label: t("alerts.type"), render: (item) => <strong>{t(`event.${item.type}` as never)}</strong> }, { key: "vehicle", label: t("common.vehicle"), render: (item) => item.vehicleId }, { key: "trip", label: t("common.trip"), render: (item) => item.tripId }, { key: "date", label: t("alerts.datetime"), render: (item) => item.date }, { key: "status", label: t("common.status"), render: (item) => <StatusPill status={item.status} /> }, { key: "actions", label: t("common.actions"), render: (item) => <RowActions onView={() => setSelected(item)} /> }];
  const review = async () => { if (!selected) return; try { const updated = await alertService.review(selected.id); setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelected(updated); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo revisar la alerta."); } };
  return <div className="module-page"><PageHeader title={t("alerts.title")} subtitle={t("alerts.subtitle")} /><FilterBar><SearchInput value={search} onChange={setSearch} placeholder={t("alerts.search")} /><Select label={t("alerts.type")} value={type} onChange={(event) => setType(event.target.value)}><option value="all">{t("common.all")}</option>{["ROUTE_DEVIATION", "PROLONGED_STOP", "CONNECTION_LOSS", "CONNECTION_RECOVERY", "DESTINATION_ARRIVAL", "EMERGENCY", "TRIP_STARTED"].map((value) => <option key={value} value={value}>{t(`event.${value}` as never)}</option>)}</Select><Select label={t("common.status")} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t("common.all")}</option><option value="pending">{t("common.pending")}</option><option value="reviewed">{t("common.reviewed")}</option></Select></FilterBar><AsyncState loading={loading} error={error} empty={!loading && !error && filtered.length === 0} onRetry={() => void load()} />{!loading && !error && filtered.length > 0 && <DataTable rows={filtered} columns={columns} getKey={(item) => item.id} />}<Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={t("alerts.detail")}>{selected && <div className="alert-detail"><div className="alert-detail__hero"><RadioTower /><div><small>{selected.id}</small><h3>{t(`event.${selected.type}` as never)}</h3></div><StatusPill status={selected.status} /></div><dl><div><dt>{t("common.trip")}</dt><dd>{selected.tripId}</dd></div><div><dt>{t("common.vehicle")}</dt><dd>{selected.vehicleId}</dd></div><div><dt>{t("common.driver")}</dt><dd>{selected.driver}</dd></div><div><dt>{t("alerts.position")}</dt><dd><MapPin size={14} />{selected.position}</dd></div><div><dt>{t("common.description")}</dt><dd>{selected.description}</dd></div></dl><h4>{t("alerts.telemetry")}</h4><ol className="evidence-list">{selected.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ol>{selected.status === "pending" && <Button onClick={() => void review()}><CheckCircle2 size={17} />{t("alerts.markReviewed")}</Button>}</div>}</Modal></div>;
}
