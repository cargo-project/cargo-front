"use client";

import maplibregl, { Marker, Popup } from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { Vehicle } from "@/types/vehicle";

interface MapProps { vehicles: Vehicle[]; selectedId: string; onSelect: (id: string) => void; language: "es" | "en"; }

function popupContent(vehicle: Vehicle) {
  const root = document.createElement("div");
  root.className = "map-popup";
  root.innerHTML = `<div class="map-popup__head"><span>Unidad</span><strong>${vehicle.id}</strong><em>${vehicle.status}</em></div><dl><div><dt>Placa</dt><dd>${vehicle.plate}</dd></div><div><dt>Conductor</dt><dd>${vehicle.driver}</dd></div><div><dt>Recorrido</dt><dd>${vehicle.origin} → ${vehicle.destination}</dd></div><div><dt>Última actualización</dt><dd>${vehicle.lastSignal}</dd></div></dl><button type="button">Ver detalle</button>`;
  return root;
}

export function MapLibreMap({ vehicles, selectedId, onSelect, language }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, { marker: Marker; popup: Popup; element: HTMLButtonElement }>());
  const selectRef = useRef(onSelect);
  const vehiclesRef = useRef(vehicles);
  selectRef.current = onSelect;
  vehiclesRef.current = vehicles;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const markerEntries = markersRef.current;
    const map = new maplibregl.Map({ container: containerRef.current, style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] }, center: [-77.0428, -12.0805], zoom: 10.5, attributionControl: false });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    mapRef.current = map;
    return () => { markerEntries.forEach(({ marker }) => marker.remove()); markerEntries.clear(); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const activeIds = new Set(vehicles.map((vehicle) => vehicle.id));
    markersRef.current.forEach(({ marker }, id) => {
      if (!activeIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });
    vehicles.forEach((vehicle) => {
      const current = markersRef.current.get(vehicle.id);
      if (current) {
        current.marker.setLngLat([vehicle.longitude, vehicle.latitude]);
        current.popup.setDOMContent(popupContent(vehicle));
        current.element.classList.toggle("is-selected", vehicle.id === selectedId);
        return;
      }
      const element = document.createElement("button");
      element.className = "truck-marker";
      element.setAttribute("aria-label", `Seleccionar unidad ${vehicle.id}`);
      element.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17h4V5H2v12h3m5 0H8m11 0h3v-5l-3-3h-5v8h2m3 0h-3m3 0h3M7.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm11 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      element.addEventListener("click", () => selectRef.current(vehicle.id));
      const popup = new maplibregl.Popup({ offset: 28, closeButton: true, className: "cargo-map-popup", maxWidth: "310px" }).setDOMContent(popupContent(vehicle));
      const marker = new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([vehicle.longitude, vehicle.latitude]).setPopup(popup).addTo(map);
      markersRef.current.set(vehicle.id, { marker, popup, element });
    });
  }, [selectedId, vehicles]);

  useEffect(() => {
    const map = mapRef.current;
    const selected = vehiclesRef.current.find((v) => v.id === selectedId);
    if (!map || !selected) return;
    markersRef.current.forEach(({ element, popup }, id) => { element.classList.toggle("is-selected", id === selectedId); if (id !== selectedId) popup.remove(); });
    map.flyTo({ center: [selected.longitude, selected.latitude], zoom: Math.max(map.getZoom(), 12), duration: 800 });
    const entry = markersRef.current.get(selectedId);
    if (entry && !entry.popup.isOpen()) entry.marker.togglePopup();
  }, [selectedId]);

  return <div ref={containerRef} className="map-canvas" aria-label={language === "es" ? "Mapa de ubicación de vehículos" : "Vehicle location map"} />;
}
