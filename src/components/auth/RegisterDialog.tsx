"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";

/** Alta desde el login. La cuenta queda pendiente hasta que un administrador la apruebe. */
export function RegisterDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (isOpen) { setDone(""); setError(""); } }, [isOpen]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("repeatPassword"))) { setError(t("forgot.mismatch")); return; }
    setBusy(true);
    try {
      const result = await authService.register({ fullName: String(data.get("fullName")).trim(), email: String(data.get("email")).trim(), password, telegramChatId: String(data.get("telegramChatId")).trim() });
      setDone(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("register.failed")); }
    finally { setBusy(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={t("register.title")}>
    {done ? <div className="forgot-done"><CheckCircle2 size={34} /><p><strong>{t("register.doneTitle")}</strong></p><p>{done}</p>
      <div className="form-actions"><Button type="button" onClick={onClose}>{t("forgot.backToLogin")}</Button></div></div>
      : <form className="form-grid register-form" onSubmit={submit}>
        <p className="forgot-help form-field--wide">{t("register.intro")}</p>
        <Input name="fullName" label={t("admin.fullName")} required minLength={2} autoComplete="name" />
        <Input name="email" type="email" label={t("forgot.email")} required autoComplete="email" />
        <Input name="password" type="password" label={t("register.password")} minLength={10} hint={t("forgot.passwordHint")} required autoComplete="new-password" />
        <Input name="repeatPassword" type="password" label={t("forgot.repeatPassword")} minLength={10} required autoComplete="new-password" />
        <div className="form-field--wide"><Input name="telegramChatId" label={t("admin.telegramChatId")} inputMode="numeric" pattern="-?[0-9]{1,20}" placeholder="123456789" hint={t("register.telegramHint")} required /></div>
        {error && <p className="form-error form-field--wide" role="alert">{error}</p>}
        <div className="form-actions"><Button type="button" variant="ghost" onClick={onClose}>{t("common.cancel")}</Button><Button type="submit" disabled={busy}><UserPlus size={16} />{t("register.submit")}</Button></div>
      </form>}
  </Modal>;
}
