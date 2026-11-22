"use client";

import { useEffect, useRef } from "react";
import type { Vehicle } from "@/types/vehicle";

interface GoogleLatLng { lat: number; lng: number }
interface GoogleMapInstance { panTo(position: GoogleLatLng): void; setZoom(zoom: number): void; }
interface GoogleMarkerInstance { setMap(map: GoogleMapInstance | null): void; setPosition(position: GoogleLatLng): void; }
interface GoogleInfoWindowInstance { open(options: { map: GoogleMapInstance; anchor: GoogleMarkerInstance }): void; close(): void; setContent(content: string): void; }
interface GoogleMapsApi {
  Map: new (el: HTMLElement, options: { center: GoogleLatLng; zoom: number; disableDefaultUI: boolean; zoomControl: boolean }) => GoogleMapInstance;
  Marker: new (options: { map: GoogleMapInstance; position: GoogleLatLng; title: string; icon: { path: string; fillColor: string; fillOpacity: number; strokeColor: string; strokeWeight: number; scale: number } }) => GoogleMarkerInstance & { addListener(name: string, handler: () => void): void };
  InfoWindow: new (options: { content: string; maxWidth: number }) => GoogleInfoWindowInstance;
  SymbolPath: { FORWARD_CLOSED_ARROW: string };
}
declare global { interface Window { google?: { maps: GoogleMapsApi } } }

interface Props { apiKey: string; vehicles: Vehicle[]; selectedId: string; onSelect: (id: string) => void; language: "es" | "en"; }

const infoContent = (vehicle: Vehicle) => `<div class="map-popup"><div class="map-popup__head"><span>Unidad</span><strong>${vehicle.id}</strong><em>${vehicle.status}</em></div><dl><div><dt>Placa</dt><dd>${vehicle.plate}</dd></div><div><dt>Conductor</dt><dd>${vehicle.driver}</dd></div><div><dt>Recorrido</dt><dd>${vehicle.origin} → ${vehicle.destination}</dd></div><div><dt>Última actualización</dt><dd>${vehicle.lastSignal}</dd></div></dl></div>`;

export function GoogleFleetMap({ apiKey, vehicles, selectedId, onSelect, language }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const entriesRef = useRef(new Map<string, { marker: GoogleMarkerInstance; info: GoogleInfoWindowInstance }>());
  const vehiclesRef = useRef(vehicles);
  const selectRef = useRef(onSelect); selectRef.current = onSelect;
  vehiclesRef.current = vehicles;

  useEffect(() => {
    let cancelled = false;
    const mapEntries = entriesRef.current;
    const init = () => {
      if (cancelled || !containerRef.current || !window.google || mapRef.current) return;
      const maps = window.google.maps;
      const map = new maps.Map(containerRef.current, { center: { lat: -12.0805, lng: -77.0428 }, zoom: 11, disableDefaultUI: true, zoomControl: true });
      vehiclesRef.current.forEach((v) => {
        const marker = new maps.Marker({ map, position: { lat: v.latitude, lng: v.longitude }, title: v.id, icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, fillColor: "#093D77", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2, scale: 7 } });
        const info = new maps.InfoWindow({ maxWidth: 300, content: infoContent(v) });
        marker.addListener("click", () => selectRef.current(v.id)); mapEntries.set(v.id, { marker, info });
      });
      mapRef.current = map;
    };
    if (window.google) init(); else {
      const existing = document.querySelector<HTMLScriptElement>("script[data-cargo-google-maps]");
      if (existing) existing.addEventListener("load", init); else { const script = document.createElement("script"); script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`; script.async = true; script.dataset.cargoGoogleMaps = "true"; script.addEventListener("load", init); document.head.appendChild(script); }
    }
    return () => { cancelled = true; mapEntries.forEach(({ marker, info }) => { marker.setMap(null); info.close(); }); mapEntries.clear(); mapRef.current = null; };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = window.google?.maps;
    if (!map || !maps) return;
    const activeIds = new Set(vehicles.map((vehicle) => vehicle.id));
    entriesRef.current.forEach(({ marker, info }, id) => {
      if (!activeIds.has(id)) { info.close(); marker.setMap(null); entriesRef.current.delete(id); }
    });
    vehicles.forEach((vehicle) => {
      const position = { lat: vehicle.latitude, lng: vehicle.longitude };
      const current = entriesRef.current.get(vehicle.id);
      if (current) { current.marker.setPosition(position); current.info.setContent(infoContent(vehicle)); return; }
      const marker = new maps.Marker({ map, position, title: vehicle.id, icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, fillColor: "#093D77", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2, scale: 7 } });
      const info = new maps.InfoWindow({ maxWidth: 300, content: infoContent(vehicle) });
      marker.addListener("click", () => selectRef.current(vehicle.id));
      entriesRef.current.set(vehicle.id, { marker, info });
    });
  }, [vehicles]);

  useEffect(() => { const map = mapRef.current; const vehicle = vehiclesRef.current.find((v) => v.id === selectedId); if (!map || !vehicle) return; entriesRef.current.forEach(({ info }, id) => id !== selectedId && info.close()); map.panTo({ lat: vehicle.latitude, lng: vehicle.longitude }); map.setZoom(13); const entry = entriesRef.current.get(selectedId); if (entry) entry.info.open({ map, anchor: entry.marker }); }, [selectedId]);
  return <div ref={containerRef} className="map-canvas" aria-label={language === "es" ? "Mapa de Google con ubicación de vehículos" : "Google map with vehicle locations"} />;
}
