"use client";

import { Lock, Pencil, Plus, Send, TriangleAlert, UserCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ApiAdminAccount, ApiUser } from "@/types/api";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { DataTable, type TableColumn } from "@/components/ui/DataTable";
import { Input, Select } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Toast } from "@/components/ui/Toast";
import { formatDateTime, relativeTime } from "@/utils/format";
import { AdminGuard } from "./AdminGuard";

function UsersContent() {
  const { t } = useLanguage();
  const { user: me } = useAuth();
  const [accounts, setAccounts] = useState<ApiAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ApiAdminAccount | null>(null);
  const [toast, setToast] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setAccounts((await adminService.overview()).accounts); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("admin.loadFailed")); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { void load(); }, [load]);
  const pendingCount = accounts.filter((a) => !a.isActive && !a.lastLoginAt).length;
  const done = async (message: string) => { setCreating(false); setEditing(null); setToast(message); window.setTimeout(() => setToast(""), 2500); await load(); };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setFormError(""); const data = new FormData(event.currentTarget);
    try { await adminService.createUser({ email: String(data.get("email")).trim(), fullName: String(data.get("fullName")).trim(), password: String(data.get("password")), role: String(data.get("role")) as ApiUser["role"], telegramChatId: String(data.get("telegramChatId")).trim() }); await done(t("admin.userCreated")); }
    catch (reason) { setFormError(reason instanceof Error ? reason.message : t("admin.saveFailed")); }
    finally { setSaving(false); }
  };
  const update = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editing) return; setSaving(true); setFormError(""); const data = new FormData(event.currentTarget);
    try { await adminService.updateUser(editing.id, { fullName: String(data.get("fullName")).trim(), role: String(data.get("role")) as ApiUser["role"], isActive: data.get("isActive") === "true", telegramChatId: String(data.get("telegramChatId")).trim() }); await done(t("common.updated")); }
    catch (reason) { setFormError(reason instanceof Error ? reason.message : t("admin.saveFailed")); }
    finally { setSaving(false); }
  };
  const toggleActive = async (account: ApiAdminAccount) => {
    try { await adminService.updateUser(account.id, { isActive: !account.isActive }); await done(account.isActive ? t("admin.userDisabled") : !account.lastLoginAt ? t("admin.userApproved") : t("admin.userEnabled")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("admin.saveFailed")); }
  };

  const columns: TableColumn<ApiAdminAccount>[] = [
    { key: "name", label: t("admin.user"), render: (a) => <span><strong>{a.fullName}</strong>{a.id === me?.id && <em className="admin-you"> · {t("admin.you")}</em>}<small className="cell-subtitle">{a.email}</small></span> },
    { key: "role", label: t("admin.role"), render: (a) => <span className={`admin-role admin-role--${a.role.toLowerCase()}`}>{t(`admin.roles.${a.role}` as never)}</span> },
    { key: "status", label: t("common.status"), render: (a) => !a.isActive && !a.lastLoginAt ? <span className="status-pill status-pill--pending"><span />{t("admin.pending")}</span> : a.lockedUntil ? <span className="status-pill status-pill--offline"><span /><Lock size={11} /> {t("admin.locked")}</span> : <span className={`status-pill status-pill--${a.isActive ? "online" : "inactive"}`}><span />{a.isActive ? t("common.active") : t("common.inactive")}</span> },
    { key: "telegram", label: "Telegram", render: (a) => a.telegramChatId ? <span className="admin-telegram"><Send size={13} />{a.telegramChatId}</span> : <span className="admin-telegram admin-telegram--missing"><TriangleAlert size={13} />{t("admin.telegramMissing")}</span> },
    { key: "last", label: t("admin.lastLogin"), render: (a) => <span title={formatDateTime(a.lastLoginAt ?? undefined)}>{a.lastLoginAt ? relativeTime(a.lastLoginAt) : t("admin.never")}</span> },
    { key: "failed", label: t("admin.failedLogins"), render: (a) => <span className={a.failedLoginsLastDay ? "admin-warning-text" : ""}>{a.failedLoginsLastDay}</span> },
    { key: "created", label: t("admin.createdAt"), render: (a) => formatDateTime(a.createdAt) },
    { key: "actions", label: t("common.actions"), render: (a) => <div className="row-actions">
      <button onClick={() => { setFormError(""); setEditing(a); }} aria-label={t("common.edit")} title={t("common.edit")}><Pencil size={16} /></button>
      {a.id !== me?.id && <button className={a.isActive ? "row-actions__delete" : ""} onClick={() => void toggleActive(a)} aria-label={a.isActive ? t("admin.disable") : !a.lastLoginAt ? t("admin.approve") : t("admin.enable")} title={a.isActive ? t("admin.disable") : !a.lastLoginAt ? t("admin.approve") : t("admin.enable")}>{a.isActive ? <UserX size={16} /> : <UserCheck size={16} />}</button>}
    </div> },
  ];

  return <div className="module-page admin-page">
    <PageHeader title={t("admin.usersTitle")} subtitle={t("admin.usersSubtitle")} action={<Button onClick={() => { setFormError(""); setCreating(true); }}><Plus size={17} />{t("admin.addUser")}</Button>} />
    <div className="admin-role-legend card"><div><strong>{t("admin.roles.ADMIN")}</strong><p>{t("admin.roleAdminText")}</p></div><div><strong>{t("admin.roles.OPERATOR")}</strong><p>{t("admin.roleOperatorText")}</p></div></div>
    {pendingCount > 0 && <p className="admin-pending-banner card">{t("admin.pendingBanner").replace("{n}", String(pendingCount))}</p>}
    <AsyncState loading={loading} error={error} empty={!loading && !error && accounts.length === 0} onRetry={() => void load()} />
    {!loading && accounts.length > 0 && <DataTable rows={accounts} columns={columns} getKey={(a) => a.id} />}

    <Modal isOpen={creating} onClose={() => setCreating(false)} title={t("admin.addUser")}><form className="form-grid" onSubmit={create}>
      <Input name="fullName" label={t("admin.fullName")} required minLength={2} />
      <Input name="email" type="email" label={t("admin.email")} required />
      <Input name="password" type="password" label={t("admin.initialPassword")} hint={t("admin.passwordHint")} required minLength={10} autoComplete="new-password" />
      <Input name="telegramChatId" label={t("admin.telegramChatId")} inputMode="numeric" pattern="-?[0-9]{1,20}" placeholder="123456789" hint={t("admin.telegramHint")} required />
      <Select name="role" label={t("admin.role")} defaultValue="OPERATOR"><option value="OPERATOR">{t("admin.roles.OPERATOR")}</option><option value="ADMIN">{t("admin.roles.ADMIN")}</option></Select>
      {formError && <p className="form-error form-field--wide" role="alert">{formError}</p>}
      <div className="form-actions"><Button type="button" variant="ghost" onClick={() => setCreating(false)}>{t("common.cancel")}</Button><Button type="submit" disabled={saving}>{t("common.save")}</Button></div>
    </form></Modal>

    <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.fullName ?? ""}>{editing && <form className="form-grid" onSubmit={update}>
      <Input name="fullName" label={t("admin.fullName")} defaultValue={editing.fullName} required minLength={2} />
      <Input name="email" label={t("admin.email")} defaultValue={editing.email} disabled />
      <Input name="telegramChatId" label={t("admin.telegramChatId")} defaultValue={editing.telegramChatId ?? ""} inputMode="numeric" pattern="-?[0-9]{1,20}" hint={t("admin.telegramHint")} required />
      <Select name="role" label={t("admin.role")} defaultValue={editing.role} disabled={editing.id === me?.id}><option value="OPERATOR">{t("admin.roles.OPERATOR")}</option><option value="ADMIN">{t("admin.roles.ADMIN")}</option></Select>
      <Select name="isActive" label={t("common.status")} defaultValue={String(editing.isActive)} disabled={editing.id === me?.id}><option value="true">{t("common.active")}</option><option value="false">{t("common.inactive")}</option></Select>
      {editing.id === me?.id && <p className="admin-note form-field--wide">{t("admin.selfNote")}</p>}
      {formError && <p className="form-error form-field--wide" role="alert">{formError}</p>}
      <div className="form-actions"><Button type="button" variant="ghost" onClick={() => setEditing(null)}>{t("common.cancel")}</Button><Button type="submit" disabled={saving}>{t("common.save")}</Button></div>
    </form>}</Modal>
    {toast && <Toast message={toast} />}
  </div>;
}

export function AdminUsersPage() { return <AdminGuard><UsersContent /></AdminGuard>; }
