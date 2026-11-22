"use client";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/locales/es";
const STATUS_KEYS: Record<string, TranslationKey> = { available:"status.available", onRoute:"status.onRoute", stopped:"status.stopped", maintenance:"status.maintenance", offline:"status.offline", assigned:"status.assigned", inactive:"status.inactive", configured:"status.configured", ongoing:"status.ongoing", completed:"status.completed", cancelled:"status.cancelled", online:"status.online", pending:"common.pending", reviewed:"common.reviewed" };
export function StatusPill({ status }: { status: string }) { const { t } = useLanguage(); return <span className={`status-pill status-pill--${status}`}><span />{t(STATUS_KEYS[status] ?? "common.status")}</span>; }
