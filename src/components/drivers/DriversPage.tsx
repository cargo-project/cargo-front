"use client";
import { Plus, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Driver, DriverStatus } from "@/types/domain";
import { driverService } from "@/services/driverService";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Input, Select } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/Actions";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusPill } from "@/components/ui/StatusPill";

export function DriversPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Driver | null>(null);
  const [detail, setDetail] = useState<Driver | null>(null);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setItems(await driverService.getDrivers()); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar los conductores."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => items.filter((item) => (status === "all" || item.status === status) && `${item.firstName} ${item.lastName} ${item.document}`.toLowerCase().includes(search.toLowerCase())), [items, search, status]);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(""); const data = new FormData(event.currentTarget);
    const input = { code: editing?.id, firstName: String(data.get("firstName")), lastName: String(data.get("lastName")), document: String(data.get("document")), license: String(data.get("license")), phone: String(data.get("phone")), status: String(data.get("status")) as DriverStatus };
    try { const value = editing ? await driverService.updateDriver(editing.id, input) : await driverService.createDriver(input); setItems((current) => editing ? current.map((item) => item.id === editing.id ? value : item) : [value, ...current]); setOpen(false); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar."); } finally { setSaving(false); }
  };
  const columns: TableColumn<Driver>[] = [{ key: "name", label: t("drivers.name"), render: (item) => <strong>{item.firstName} {item.lastName}</strong> }, { key: "document", label: t("drivers.document"), render: (item) => item.document }, { key: "license", label: t("drivers.license"), render: (item) => item.license }, { key: "phone", label: t("drivers.phone"), render: (item) => item.phone }, { key: "status", label: t("common.status"), render: (item) => <StatusPill status={item.status} /> }, { key: "vehicle", label: t("drivers.assignedVehicle"), render: (item) => item.vehicle ?? t("common.none") }, { key: "trip", label: t("drivers.currentTrip"), render: (item) => item.currentTrip ?? "—" }, { key: "actions", label: t("common.actions"), render: (item) => <RowActions onView={() => setDetail(item)} onEdit={() => { setEditing(item); setOpen(true); }} /> }];
  return <div className="module-page"><PageHeader title={t("drivers.title")} subtitle={t("drivers.subtitle")} action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={17} />{t("drivers.add")}</Button>} /><FilterBar><SearchInput value={search} onChange={setSearch} placeholder={t("drivers.search")} /><Select label={t("common.status")} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t("common.all")}</option>{["available", "assigned", "inactive"].map((value) => <option key={value} value={value}>{t(`status.${value}` as never)}</option>)}</Select></FilterBar><AsyncState loading={loading} error={error} empty={!loading && !error && filtered.length === 0} onRetry={() => void load()} />{!loading && !error && filtered.length > 0 && <DataTable rows={filtered} columns={columns} getKey={(item) => item.id} />}<Modal isOpen={open} onClose={() => setOpen(false)} title={t("drivers.formTitle")}><form className="form-grid" onSubmit={save}><Input name="firstName" label={t("drivers.firstName")} defaultValue={editing?.firstName} required /><Input name="lastName" label={t("drivers.lastName")} defaultValue={editing?.lastName} required /><Input name="document" label={t("drivers.document")} defaultValue={editing?.document} pattern="[0-9]{8}|[A-Za-z0-9]{9,12}" hint={t("drivers.documentHint")} placeholder="45781236" required /><Input name="license" label={t("drivers.license")} defaultValue={editing?.license} pattern="[A-Za-z][\-\s]?[0-9]{8}" hint={t("drivers.licenseHint")} placeholder="Q45781236" required /><Input name="phone" label={t("drivers.phone")} defaultValue={editing?.phone} type="tel" pattern="(\+51\s?)?9[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}" hint={t("drivers.phoneHint")} placeholder="987654321" required /><Select name="status" label={t("common.status")} defaultValue={editing?.status ?? "available"}>{["available", "assigned", "inactive"].map((value) => <option key={value} value={value}>{t(`status.${value}` as never)}</option>)}</Select><div className="form-actions"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel")}</Button><Button type="submit" disabled={saving}>{t("common.save")}</Button></div></form></Modal><Modal isOpen={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? `${detail.firstName} ${detail.lastName}` : ""}>{detail && <div className="detail-grid"><span className="detail-icon"><UserRound /></span><dl><div><dt>{t("drivers.document")}</dt><dd>{detail.document}</dd></div><div><dt>{t("drivers.license")}</dt><dd>{detail.license}</dd></div><div><dt>{t("drivers.phone")}</dt><dd>{detail.phone}</dd></div></dl></div>}</Modal></div>;
}
