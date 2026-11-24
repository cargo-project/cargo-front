"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiActivityEntry } from "@/types/api";
import { adminService, type ActivityCategory } from "@/services/adminService";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Select } from "@/components/ui/FormField";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDateTime } from "@/utils/format";
import { AdminGuard } from "./AdminGuard";

const CATEGORIES: ActivityCategory[] = ["all", "auth", "users", "fleet", "trips", "notifications", "settings"];
const PAGE = 50;

function detailText(entry: ApiActivityEntry): string {
  return Object.entries(entry.details ?? {})
    .filter(([, value]) => value !== null && value !== "" && typeof value !== "object")
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

function ActivityContent() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<ActivityCategory>("all");
  const [items, setItems] = useState<ApiActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (selected: ActivityCategory, before?: string) => {
    setLoading(true); setError("");
    try {
      const page = await adminService.activity(selected, before);
      setItems((current) => (before ? [...current, ...page] : page));
      setMore(page.length === PAGE);
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("admin.loadFailed")); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { void load(category); }, [load, category]);

  const label = (action: string) => { const key = `activity.${action}`; const text = t(key as never); return text && text !== key ? text : action; };
  const columns: TableColumn<ApiActivityEntry>[] = [
    { key: "when", label: t("admin.when"), render: (e) => formatDateTime(e.occurredAt) },
    { key: "action", label: t("admin.action"), render: (e) => <span className={`admin-action admin-action--${e.action.replace(/\./g, "-")}`}>{label(e.action)}</span> },
    { key: "actor", label: t("admin.actor"), render: (e) => e.actorName ? <span>{e.actorName}<small className="cell-subtitle">{e.actorEmail}</small></span> : <span className="cell-subtitle">{t("admin.system")}</span> },
    { key: "entity", label: t("admin.entity"), render: (e) => <span>{t(`admin.entityType.${e.entityType}` as never) || e.entityType}<small className="cell-subtitle">{e.entityType === "user" ? "" : e.entityId}</small></span> },
    { key: "details", label: t("admin.details"), render: (e) => <small>{detailText(e) || "—"}</small> },
  ];

  return <div className="module-page admin-page">
    <PageHeader title={t("admin.activityTitle")} subtitle={t("admin.activitySubtitle")} />
    <FilterBar><Select label={t("admin.category")} value={category} onChange={(event) => setCategory(event.target.value as ActivityCategory)}>{CATEGORIES.map((value) => <option key={value} value={value}>{t(`admin.categories.${value}` as never)}</option>)}</Select></FilterBar>
    <AsyncState loading={loading && items.length === 0} error={error} empty={!loading && !error && items.length === 0} onRetry={() => void load(category)} />
    {items.length > 0 && <DataTable rows={items} columns={columns} getKey={(e) => e.id} />}
    {more && <div className="admin-more"><Button variant="secondary" disabled={loading} onClick={() => void load(category, items[items.length - 1]?.occurredAt)}>{t("admin.loadMore")}</Button></div>}
  </div>;
}

export function AdminActivityPage() { return <AdminGuard><ActivityContent /></AdminGuard>; }
