"use client";

import { Plus, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FleetVehicle, VehicleOperationalStatus } from "@/types/domain";
import { vehicleService } from "@/services/vehicleService";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Input, Select, Textarea } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/Actions";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toast } from "@/components/ui/Toast";

export function VehiclesPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<FleetVehicle | null>(null);
  const [detail, setDetail] = useState<FleetVehicle | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await vehicleService.getVehicles()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar los vehículos."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => items.filter((item) => (status === "all" || item.status === status) && `${item.id} ${item.plate} ${item.brand}`.toLowerCase().includes(search.toLowerCase())), [items, search, status]);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("");
    const data = new FormData(event.currentTarget);
    const input = { code: String(data.get("code")), plate: String(data.get("plate")), brand: String(data.get("brand")), model: String(data.get("model")), description: String(data.get("description")), status: String(data.get("status")) as VehicleOperationalStatus };
    try {
      const value = editing ? await vehicleService.updateVehicle(editing.id, input) : await vehicleService.createVehicle(input);
      setItems((current) => editing ? current.map((item) => item.id === editing.id ? value : item) : [value, ...current]);
      setOpen(false); setToast(editing ? t("common.updated") : t("common.created")); window.setTimeout(() => setToast(""), 2500);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar."); }
    finally { setSaving(false); }
  };
  const columns: TableColumn<FleetVehicle>[] = [
    { key: "unit", label: t("vehicles.unit"), render: (item) => <strong className="primary-text">{item.id}</strong> },
    { key: "plate", label: t("vehicles.plate"), render: (item) => item.plate },
    { key: "brand", label: t("vehicles.brandModel"), render: (item) => <span>{item.brand}<small className="cell-subtitle">{item.model}</small></span> },
    { key: "status", label: t("common.status"), render: (item) => <StatusPill status={item.status} /> },
    { key: "driver", label: t("vehicles.currentDriver"), render: (item) => item.driver ?? t("common.none") },
    { key: "trip", label: t("vehicles.currentTrip"), render: (item) => item.currentTrip ?? "—" },
    { key: "signal", label: t("vehicles.lastSignal"), render: (item) => item.lastSignal },
    { key: "actions", label: t("common.actions"), render: (item) => <RowActions onView={() => setDetail(item)} onEdit={() => { setEditing(item); setOpen(true); }} /> },
  ];
  return <div className="module-page"><PageHeader title={t("vehicles.title")} subtitle={t("vehicles.subtitle")} action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={17} />{t("vehicles.add")}</Button>} /><FilterBar><SearchInput value={search} onChange={setSearch} placeholder={t("vehicles.search")} /><Select label={t("common.status")} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t("common.all")}</option>{["available", "onRoute", "stopped", "maintenance", "offline"].map((value) => <option key={value} value={value}>{t(`status.${value}` as never)}</option>)}</Select></FilterBar><AsyncState loading={loading} error={error} empty={!loading && !error && filtered.length === 0} onRetry={() => void load()} />{!loading && !error && filtered.length > 0 && <DataTable rows={filtered} columns={columns} getKey={(item) => item.id} />}
    <Modal isOpen={open} onClose={() => setOpen(false)} title={t("vehicles.formTitle")}><form className="form-grid" onSubmit={save}><Input name="code" label={t("vehicles.code")} defaultValue={editing?.id} pattern="[A-Za-z0-9\-]{2,24}" required disabled={Boolean(editing)} /><Input name="plate" label={t("vehicles.plate")} defaultValue={editing?.plate} pattern="[A-Za-z0-9]{3}[\-\s]?[0-9]{3}" hint={t("vehicles.plateHint")} placeholder="ABC-123" required /><Input name="brand" label={t("vehicles.brand")} defaultValue={editing?.brand} required /><Input name="model" label={t("vehicles.model")} defaultValue={editing?.model} required /><Select name="status" label={t("common.status")} defaultValue={editing?.status ?? "available"}>{["available", "onRoute", "stopped", "maintenance", "offline"].map((value) => <option key={value} value={value}>{t(`status.${value}` as never)}</option>)}</Select><Textarea name="description" label={t("common.description")} defaultValue={editing?.description} /><div className="form-actions"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel")}</Button><Button type="submit" disabled={saving}>{t("common.save")}</Button></div></form></Modal>
    <Modal isOpen={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.id ?? ""}>{detail && <div className="detail-grid"><span className="detail-icon"><Truck /></span><dl><div><dt>{t("vehicles.plate")}</dt><dd>{detail.plate}</dd></div><div><dt>{t("vehicles.brandModel")}</dt><dd>{detail.brand} {detail.model}</dd></div><div><dt>{t("common.status")}</dt><dd><StatusPill status={detail.status} /></dd></div><div><dt>{t("common.description")}</dt><dd>{detail.description}</dd></div></dl></div>}</Modal>{toast && <Toast message={toast} />}</div>;
}
