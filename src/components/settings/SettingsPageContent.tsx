"use client";

import { Bell, LockKeyhole, Plus, RadioTower, Save, Settings2, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProfilePanel } from "./ProfilePanel";
import { useLanguage } from "@/i18n/LanguageContext";
import { userService } from "@/services/userService";
import type { User } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toast } from "@/components/ui/Toast";
import { settingsService } from "@/services/settingsService";
import type { ApiSettings } from "@/types/api";
import { AsyncState } from "@/components/ui/AsyncState";
import { useAuth } from "@/auth/AuthContext";
import { authService } from "@/services/authService";

type Tab = "profile" | "general" | "notifications" | "monitoring" | "security";

export function SettingsPageContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isOperator = user?.role === "OPERATOR";
  const requestedTab = useSearchParams().get("tab");
  const [tab, setTab] = useState<Tab>("general");
  useEffect(() => { if (requestedTab === "profile" && isOperator) setTab("profile"); }, [requestedTab, isOperator]);
  const [telegram, setTelegram] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isRecipientModalOpen, setRecipientModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState<ApiSettings>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletingRecipientId, setDeletingRecipientId] = useState("");

  useEffect(() => { Promise.all([userService.getUsers(), settingsService.get()]).then(([recipientItems, data]) => { setUsers(recipientItems); setSettings(data); setTelegram(data.general.telegramEnabled); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo cargar la configuración.")).finally(() => setLoading(false)); }, []);

  const tabs: [Tab, React.ReactNode, string][] = [
    ...(isOperator ? [["profile", <UserRound key="p" />, t("profile.tab")] as [Tab, React.ReactNode, string]] : []),
    ["general", <Settings2 key="g" />, t("settings.general")],
    ["notifications", <Bell key="n" />, t("settings.notifications")],
    ["monitoring", <RadioTower key="m" />, t("settings.monitoring")],
    ["security", <LockKeyhole key="s" />, t("settings.security")],
  ];

  const showSaved = async () => {
    if (!settings) return;
    setError("");
    try { const updated = await settingsService.update({ ...settings, general: { ...settings.general, telegramEnabled: telegram } }); setSettings(updated); setToast(t("common.updated")); setTimeout(() => setToast(""), 2400); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar la configuración."); }
  };

  const addRecipient = async (event: React.FormEvent) => {
    event.preventDefault();
    const recipient = await userService.createTelegramRecipient({ name: recipientName, telegramChatId });
    setUsers((current) => [...current, recipient]);
    setRecipientName("");
    setTelegramChatId("");
    setRecipientModalOpen(false);
    setToast(t("create.recipientAdded"));
    setTimeout(() => setToast(""), 2400);
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    try { await authService.changePassword(currentPassword, newPassword); window.location.assign("/"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo cambiar la contraseña."); }
  };

  const deleteRecipient = async (recipient: User) => {
    if (!window.confirm(t("settings.deleteRecipientConfirm"))) return;
    setDeletingRecipientId(recipient.id); setError("");
    try {
      await userService.deleteTelegramRecipient(recipient.id);
      setUsers((current) => current.filter((item) => item.id !== recipient.id));
      setToast(t("settings.recipientDeleted"));
      setTimeout(() => setToast(""), 2400);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo eliminar el destinatario."); }
    finally { setDeletingRecipientId(""); }
  };

  if (loading || !settings) return <div className="module-page"><PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} /><AsyncState loading={loading} error={error} empty={!loading && !error} /></div>;
  const updateGeneral = <K extends keyof ApiSettings["general"]>(key: K, value: ApiSettings["general"][K]) => setSettings((current) => current ? { ...current, general: { ...current.general, [key]: value } } : current);
  const updateMonitoring = <K extends keyof ApiSettings["monitoring"]>(key: K, value: number) => setSettings((current) => current ? { ...current, monitoring: { ...current.monitoring, [key]: value } } : current);
  return <div className="module-page">
    <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
    {error && !passwordOpen && <p className="form-error" role="alert">{error}</p>}
    <div className="settings-layout">
      <nav className="settings-tabs card">{tabs.map(([id, icon, label]) => <button key={id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>{icon}<span>{label}</span></button>)}</nav>
      <section className="settings-panel card">
        {tab === "general" && <div className="settings-content"><h2>{t("settings.general")}</h2><div className="form-grid"><Input label={t("settings.organization")} value={settings.general.organizationName} onChange={(event) => updateGeneral("organizationName", event.target.value)} /><Select label={t("settings.timezone")} value={settings.general.timezone} onChange={(event) => updateGeneral("timezone", event.target.value)}><option>America/Lima</option><option>UTC</option></Select><Select label={t("settings.distance")} value={settings.general.distanceUnit} onChange={(event) => updateGeneral("distanceUnit", event.target.value as "km" | "mi")}><option value="km">Kilómetros (km)</option><option value="mi">Miles (mi)</option></Select><Select label={t("settings.defaultLanguage")} value={settings.general.defaultLanguage} onChange={(event) => updateGeneral("defaultLanguage", event.target.value as "es" | "en")}><option value="es">Español</option><option value="en">English</option></Select></div></div>}
        {tab === "profile" && isOperator && <ProfilePanel onSaved={(message) => { setToast(message); window.setTimeout(() => setToast(""), 2500); }} />}
        {tab === "notifications" && <div className="settings-content"><h2>{t("settings.notifications")}</h2><label className="switch-row"><span><strong>{t("settings.telegram")}</strong><small>Telegram Bot API</small></span><input type="checkbox" checked={telegram} disabled={user?.role !== "ADMIN"} onChange={(event) => setTelegram(event.target.checked)} /><i /></label><div className="settings-section-heading"><div><h3>{t("settings.telegramUsers")}</h3><p>{t("settings.telegramUsersHelp")}</p></div><Button type="button" variant="secondary" disabled={user?.role !== "ADMIN"} onClick={() => setRecipientModalOpen(true)}><Plus size={16} />{t("create.addRecipient")}</Button></div><div className="settings-list">{users.map((recipient) => <div key={recipient.id}><span className="avatar">{recipient.name[0]}</span><span><strong>{recipient.name}</strong><small>{recipient.telegramChatId ?? "—"}</small></span><StatusPill status={recipient.configured ? "online" : "inactive"} /><button type="button" className="icon-button recipient-delete" aria-label={t("settings.deleteRecipient")} title={t("settings.deleteRecipient")} disabled={user?.role !== "ADMIN" || deletingRecipientId === recipient.id} onClick={() => void deleteRecipient(recipient)}><Trash2 size={17} /></button></div>)}</div></div>}
        {tab === "monitoring" && <div className="settings-content"><h2>{t("settings.monitoring")}</h2><p>{t("settings.monitoringHelp")}</p><div className="form-grid monitoring-grid"><Input type="number" min="2" label={t("settings.minDeviation")} value={settings.monitoring.routeDeviationMinEvents} onChange={(event) => updateMonitoring("routeDeviationMinEvents", Number(event.target.value))} /><Input type="number" min="50" label={`${t("settings.minMoveAway")} (m)`} value={settings.monitoring.routeDeviationMinIncreaseM} onChange={(event) => updateMonitoring("routeDeviationMinIncreaseM", Number(event.target.value))} /><Input type="number" min="0" label={`${t("settings.moveAwayWindow")} (s)`} value={settings.monitoring.routeDeviationWindowSeconds} onChange={(event) => updateMonitoring("routeDeviationWindowSeconds", Number(event.target.value))} /><Input type="number" min="0" step="0.1" label={t("settings.stopSpeed")} value={settings.monitoring.stopSpeedKmh} onChange={(event) => updateMonitoring("stopSpeedKmh", Number(event.target.value))} /><Input type="number" min="0" label={t("settings.maxDisplacement")} value={settings.monitoring.stopMaxDisplacementM} onChange={(event) => updateMonitoring("stopMaxDisplacementM", Number(event.target.value))} /><Input type="number" min="1" label={`${t("settings.stopDuration")} (s)`} value={settings.monitoring.stopDurationSeconds} onChange={(event) => updateMonitoring("stopDurationSeconds", Number(event.target.value))} /><Input type="number" min="1" label={`${t("settings.noCommunication")} (s)`} value={settings.monitoring.connectionLossSeconds} onChange={(event) => updateMonitoring("connectionLossSeconds", Number(event.target.value))} /><Input type="number" min="1" label={`${t("settings.arrivalRadius")} (m)`} value={settings.monitoring.arrivalRadiusM} onChange={(event) => updateMonitoring("arrivalRadiusM", Number(event.target.value))} /><Input type="number" min="1" label={`${t("settings.arrivalConfirmation")} (s)`} value={settings.monitoring.arrivalConfirmationSeconds} onChange={(event) => updateMonitoring("arrivalConfirmationSeconds", Number(event.target.value))} /></div></div>}
        
        {tab === "security" && <div className="settings-content"><h2>{t("settings.security")}</h2><div className="security-cards"><button onClick={() => setPasswordOpen(true)}><LockKeyhole /><span><strong>{t("settings.password")}</strong><small>••••••••••</small></span></button><button><Settings2 /><span><strong>{t("settings.sessions")}</strong><small>1</small></span></button></div></div>}
        <div className="settings-actions"><Button onClick={() => void showSaved()} disabled={user?.role !== "ADMIN"}><Save size={17} />{t("settings.save")}</Button></div>
      </section>
    </div>
    <Modal isOpen={isRecipientModalOpen} onClose={() => setRecipientModalOpen(false)} title={t("create.addRecipientTitle")}><form className="modal-form" onSubmit={addRecipient}><p className="modal-form__help">{t("settings.addTelegramHelp")}</p><Input name="settingsRecipientName" label={t("create.recipientName")} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required /><Input name="settingsTelegramChatId" label={t("create.telegramChatId")} value={telegramChatId} onChange={(event) => setTelegramChatId(event.target.value)} inputMode="numeric" pattern="-?[0-9]+" required /><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setRecipientModalOpen(false)}>{t("common.cancel")}</Button><Button type="submit" disabled={!recipientName.trim() || !telegramChatId.trim()}>{t("common.save")}</Button></div></form></Modal>
    <Modal isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} title={t("settings.password")}><form className="modal-form" onSubmit={changePassword}><Input type="password" label="Contraseña actual" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} minLength={8} required /><Input type="password" label="Nueva contraseña" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={10} required />{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setPasswordOpen(false)}>{t("common.cancel")}</Button><Button type="submit">{t("common.save")}</Button></div></form></Modal>
    {toast && <Toast message={toast} />}
  </div>;
}
