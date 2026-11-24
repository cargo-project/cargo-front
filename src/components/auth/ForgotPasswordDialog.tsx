"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";

type Step = "email" | "code" | "done";

/** Recuperar la contraseña: el código de 6 dígitos llega al Telegram vinculado a la cuenta. */
export function ForgotPasswordDialog({ isOpen, onClose, initialEmail = "" }: { isOpen: boolean; onClose: () => void; initialEmail?: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (isOpen) { setStep("email"); setEmail(initialEmail); setNotice(""); setError(""); } }, [isOpen, initialEmail]);

  const requestCode = async (event?: React.FormEvent) => {
    event?.preventDefault(); setBusy(true); setError("");
    try { const result = await authService.requestPasswordReset(email.trim()); setNotice(result.message); setStep("code"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("forgot.failed")); }
    finally { setBusy(false); }
  };
  const confirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); const data = new FormData(event.currentTarget);
    const password = String(data.get("newPassword")); const repeated = String(data.get("repeatPassword"));
    if (password !== repeated) { setError(t("forgot.mismatch")); return; }
    setBusy(true);
    try { await authService.confirmPasswordReset(email.trim(), String(data.get("code")).trim(), password); setStep("done"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("forgot.failed")); }
    finally { setBusy(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={t("forgot.title")}>
    {step === "email" && <form className="modal-form forgot-form" onSubmit={requestCode}>
      <p className="forgot-help">{t("forgot.emailHelp")}</p>
      <Input name="email" type="email" label={t("forgot.email")} value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="button" variant="ghost" onClick={onClose}>{t("common.cancel")}</Button><Button type="submit" disabled={busy}><Send size={16} />{t("forgot.sendCode")}</Button></div>
    </form>}
    {step === "code" && <form className="modal-form forgot-form" onSubmit={confirm}>
      <p className="forgot-notice">{notice}</p>
      <Input name="code" label={t("forgot.code")} inputMode="numeric" pattern="\s*[0-9]{6}\s*" maxLength={8} placeholder="123456" hint={t("forgot.codeHint")} required autoComplete="one-time-code" />
      <Input name="newPassword" type="password" label={t("forgot.newPassword")} minLength={10} hint={t("forgot.passwordHint")} required autoComplete="new-password" />
      <Input name="repeatPassword" type="password" label={t("forgot.repeatPassword")} minLength={10} required autoComplete="new-password" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><Button type="button" variant="ghost" disabled={busy} onClick={() => void requestCode()}>{t("forgot.resend")}</Button><Button type="submit" disabled={busy}>{t("forgot.change")}</Button></div>
    </form>}
    {step === "done" && <div className="forgot-done">
      <CheckCircle2 size={34} /><p><strong>{t("forgot.doneTitle")}</strong></p><p>{t("forgot.doneText")}</p>
      <div className="form-actions"><Button type="button" onClick={onClose}>{t("forgot.backToLogin")}</Button></div>
    </div>}
  </Modal>;
}
