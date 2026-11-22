"use client";

import { Layers3 } from "lucide-react";
import dynamic from "next/dynamic";
import type { Vehicle } from "@/types/vehicle";
import { env } from "@/config/env";
import { useLanguage } from "@/i18n/LanguageContext";

const MapLibreMap = dynamic(() => import("./MapLibreMap").then((m) => m.MapLibreMap), { ssr: false, loading: () => <div className="map-loading">Preparando mapa…</div> });
const GoogleFleetMap = dynamic(() => import("./GoogleFleetMap").then((m) => m.GoogleFleetMap), { ssr: false, loading: () => <div className="map-loading">Preparando mapa…</div> });

interface FleetMapProps { vehicles: Vehicle[]; selectedId: string; onSelect: (id: string) => void; }

export function FleetMap(props: FleetMapProps) {
  const { t, language } = useLanguage();
  const useGoogle = Boolean(env.googleMapsApiKey);
  return <section className="map-panel card"><div className="map-panel__toolbar"><div><span className="eyebrow">{t("dashboard.monitoring")}</span><h2>{t("dashboard.location")}</h2></div><span className="map-provider"><Layers3 size={14} />{useGoogle ? "Google Maps" : "OpenStreetMap"}</span></div><div className="map-frame">{useGoogle ? <GoogleFleetMap {...props} apiKey={env.googleMapsApiKey} language={language} /> : <MapLibreMap {...props} language={language} />}</div></section>;
}
