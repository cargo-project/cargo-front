"use client";
import { Eye, Pencil } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
export function RowActions({ onView, onEdit }: { onView?: () => void; onEdit?: () => void }) { const { t } = useLanguage(); return <div className="row-actions">{onView && <button onClick={onView} aria-label={t("common.view")} title={t("common.view")}><Eye size={16} /></button>}{onEdit && <button onClick={onEdit} aria-label={t("common.edit")} title={t("common.edit")}><Pencil size={16} /></button>}</div>; }
