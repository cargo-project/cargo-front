"use client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Trip } from "@/types/domain";
import { tripService } from "@/services/tripService";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Select, Input } from "@/components/ui/FormField";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/StatusPill";
import { RowActions } from "@/components/ui/Actions";
import { useRouter } from "next/navigation";

export function TripsPage() {
  const { t } = useLanguage(); const router = useRouter();
  const [items, setItems] = useState<Trip[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all"); const [date, setDate] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await tripService.getTrips()); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar los recorridos."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => items.filter((item) => (status === "all" || item.status === status) && (!date || item.start.includes(date.split("-").reverse().join("/"))) && `${item.id} ${item.vehicleId} ${item.destination} ${item.driver}`.toLowerCase().includes(search.toLowerCase())), [items, search, status, date]);
  const columns: TableColumn<Trip>[] = [{ key: "id", label: t("trips.code"), render: (item) => <Link className="table-link" href={`/viajes/${item.id}`}>{item.id}</Link> }, { key: "vehicle", label: t("vehicles.unit"), render: (item) => <span>{item.vehicleId}<small className="cell-subtitle">{item.plate}</small></span> }, { key: "origin", label: t("trips.origin"), render: (item) => <span className="trip-location-cell" title={item.origin}>{item.origin}</span> }, { key: "destination", label: t("trips.destination"), render: (item) => <span className="trip-location-cell" title={item.destination}>{item.destination}</span> }, { key: "driver", label: t("common.driver"), render: (item) => item.driver }, { key: "status", label: t("common.status"), render: (item) => <StatusPill status={item.status} /> }, { key: "start", label: t("trips.start"), render: (item) => item.start }, { key: "progress", label: t("trips.progress"), render: (item) => <div className="progress-cell"><span style={{ width: `${item.progress}%` }} /><small>{item.progress}%</small></div> }, { key: "actions", label: t("common.actions"), render: (item) => <RowActions onView={() => router.push(`/viajes/${item.id}`)} /> }];
  return <div className="module-page"><PageHeader title={t("trips.title")} subtitle={t("trips.subtitle")} action={<Link href="/viajes/crear"><Button><Plus size={17} />{t("trips.create")}</Button></Link>} /><FilterBar><SearchInput value={search} onChange={setSearch} placeholder={t("trips.search")} /><Select label={t("common.status")} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t("common.all")}</option>{["configured", "ongoing", "completed", "cancelled"].map((value) => <option key={value} value={value}>{t(`status.${value}` as never)}</option>)}</Select><Input label={t("common.date")} type="date" value={date} onChange={(event) => setDate(event.target.value)} /></FilterBar><AsyncState loading={loading} error={error} empty={!loading && !error && filtered.length === 0} onRetry={() => void load()} />{!loading && !error && filtered.length > 0 && <DataTable rows={filtered} columns={columns} getKey={(item) => item.id} />}</div>;
}
