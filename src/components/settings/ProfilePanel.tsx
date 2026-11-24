"use client";

import { Save, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";

/** Datos de la propia cuenta. El Telegram es el canal de recuperación de contraseña (el bot verifica el chat nuevo). */
export function ProfilePanel({ onSaved }: { onSaved: (message: string) => void }) {
  const { t } = useLanguage();
  const { user, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  if (!user) return null;

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(""); const data = new FormData(event.currentTarget);
    try {
      await authService.updateProfile({ fullName: String(data.get("fullName")).trim(), telegramChatId: String(data.get("telegramChatId")).trim() });
      await refresh();
      onSaved(t("profile.saved"));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("profile.saveFailed")); }
    finally { setSaving(false); }
  };

  return <div className="settings-content profile-panel">
    <h2>{t("profile.title")}</h2>
    <p className="profile-intro">{t("profile.intro")}</p>
    <form key={`${user.fullName}-${user.telegramChatId ?? ""}`} className="form-grid" onSubmit={save}>
      <Input name="fullName" label={t("admin.fullName")} defaultValue={user.fullName} required minLength={2} />
      <Input name="email" label={t("admin.email")} defaultValue={user.email} disabled />
      <Input name="role" label={t("admin.role")} defaultValue={t(`admin.roles.${user.role}` as never)} disabled />
      <div className="profile-telegram form-field--wide">
        <div className="profile-telegram__head"><Send size={18} /><div><strong>{t("profile.telegramTitle")}</strong><small>{t("profile.telegramText")}</small></div>
          <span className={`status-pill status-pill--${user.telegramChatId ? "online" : "offline"}`}><span />{user.telegramChatId ? t("profile.linked") : t("admin.telegramMissing")}</span></div>
        <Input name="telegramChatId" label={t("admin.telegramChatId")} defaultValue={user.telegramChatId ?? ""} inputMode="numeric" pattern="-?[0-9]{1,20}" hint={t("admin.telegramHint")} required />
      </div>
      {error && <p className="form-error form-field--wide" role="alert">{error}</p>}
      <div className="form-actions"><span className="profile-secure"><ShieldCheck size={15} />{t("profile.passwordNote")}</span><Button type="submit" disabled={saving}><Save size={16} />{t("common.save")}</Button></div>
    </form>
  </div>;
}
