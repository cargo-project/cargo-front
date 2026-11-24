"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { Coordinates } from "@/types/api";
import { useLanguage } from "@/i18n/LanguageContext";

export function LocationPickerMap({ origin, destination, active, onPick }: { origin?: Coordinates; destination?: Coordinates; active: "origin" | "destination"; onPick: (point: Coordinates) => void }) {
  const { t } = useLanguage();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const originMarker = useRef<maplibregl.Marker | null>(null);
  const destinationMarker = useRef<maplibregl.Marker | null>(null);
  const callback = useRef(onPick);
  callback.current = onPick;
  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({ container: container.current, style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] }, center: [-77.03, -12.08], zoom: 9 });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("click", (event) => callback.current({ longitude: event.lngLat.lng, latitude: event.lngLat.lat }));
    return () => { mapRef.current = null; map.remove(); };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    originMarker.current?.remove();
    destinationMarker.current?.remove();
    if (origin) { const element = document.createElement("span"); element.className = "route-point route-point--0"; originMarker.current = new maplibregl.Marker({ element }).setLngLat([origin.longitude, origin.latitude]).addTo(map); }
    if (destination) { const element = document.createElement("span"); element.className = "route-point route-point--1"; destinationMarker.current = new maplibregl.Marker({ element }).setLngLat([destination.longitude, destination.latitude]).addTo(map); }
    if (origin && destination) {
      const bounds = new maplibregl.LngLatBounds([origin.longitude, origin.latitude], [origin.longitude, origin.latitude]);
      bounds.extend([destination.longitude, destination.latitude]);
      map.fitBounds(bounds, { padding: 55, maxZoom: 15, duration: 650 });
    } else {
      const point = origin ?? destination;
      if (point) map.flyTo({ center: [point.longitude, point.latitude], zoom: 15, duration: 650 });
    }
  }, [origin, destination]);
  return <div><p className="map-picker-help">{t("create.mapSelecting")} <strong>{active === "origin" ? t("create.mapOrigin") : t("create.mapDestination")}</strong>. {t("create.mapClickHint")}</p><div ref={container} className="route-map location-picker" /><div className="coordinate-summary"><span>{t("create.origin")}: {origin ? `${origin.latitude.toFixed(5)}, ${origin.longitude.toFixed(5)}` : t("create.mapPending")}</span><span>{t("create.destination")}: {destination ? `${destination.latitude.toFixed(5)}, ${destination.longitude.toFixed(5)}` : t("create.mapPending")}</span></div></div>;
}
