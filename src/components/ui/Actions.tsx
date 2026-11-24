"use client";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
export function RowActions({ onView, onEdit, onDelete }: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) { const { t } = useLanguage(); return <div className="row-actions">{onView && <button onClick={onView} aria-label={t("common.view")} title={t("common.view")}><Eye size={16} /></button>}{onEdit && <button onClick={onEdit} aria-label={t("common.edit")} title={t("common.edit")}><Pencil size={16} /></button>}{onDelete && <button className="row-actions__delete" onClick={onDelete} aria-label={t("common.delete")} title={t("common.delete")}><Trash2 size={16} /></button>}</div>; }
