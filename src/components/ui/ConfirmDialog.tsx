"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmación de una acción destructiva. Si la acción falla (por ejemplo, el registro tiene historial), muestra el motivo sin cerrarse. */
export function ConfirmDialog({ isOpen, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (isOpen) { setBusy(false); setError(""); } }, [isOpen]);
  const confirm = async () => {
    setBusy(true); setError("");
    try { await onConfirm(); onClose(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("common.deleteFailed")); }
    finally { setBusy(false); }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="confirm-dialog">
      <span className="confirm-dialog__icon"><AlertTriangle size={22} /></span>
      <div><p className="confirm-dialog__message">{message}</p><p className="confirm-dialog__hint">{t("common.cannotUndo")}</p></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><Button type="button" variant="ghost" onClick={onClose} disabled={busy}>{t("common.cancel")}</Button><Button type="button" variant="danger" onClick={() => void confirm()} disabled={busy}><Trash2 size={16} />{confirmLabel}</Button></div>
  </Modal>;
}
