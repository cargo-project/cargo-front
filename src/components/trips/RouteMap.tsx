"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { Coordinates } from "@/types/api";
import type { EventType } from "@/types/domain";

export interface RouteMapEvent {
  id: string;
  type: EventType;
  latitude: number;
  longitude: number;
  title: string;
  date: string;
  description: string;
  delayed?: boolean;
  delayedLabel?: string;
}

// Mismo ícono que el encabezado de la alerta de Telegram, para reconocer el tipo de un vistazo.
const EVENT_ICONS: Partial<Record<EventType, string>> = {
  TRIP_STARTED: "🟢",
  ROUTE_DEVIATION: "🧭",
  PROLONGED_STOP: "🛑",
  CONNECTION_LOSS: "📡",
  CONNECTION_RECOVERY: "📶",
  DESTINATION_ARRIVAL: "🏁",
  EMERGENCY: "🚨",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

function popupHtml(event: RouteMapEvent) {
  const delayed = event.delayed && event.delayedLabel ? `<span class="map-popup__tag">${escapeHtml(event.delayedLabel)}</span>` : "";
  return `<div class="map-popup"><strong>${EVENT_ICONS[event.type] ?? "🔔"} ${escapeHtml(event.title)}</strong>${delayed}<small>${escapeHtml(event.date)}</small><p>${escapeHtml(event.description)}</p></div>`;
}

export function RouteMap({ coordinates, origin, destination, events = [], selectedEventId, onSelectEvent }: {
  coordinates: [number, number][];
  origin: Coordinates;
  destination: Coordinates;
  events?: RouteMapEvent[];
  selectedEventId?: string;
  onSelectEvent?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const currentMarkerRef = useRef<maplibregl.Marker | null>(null);
  const eventMarkersRef = useRef(new Map<string, maplibregl.Marker>());
  const latestCoordinatesRef = useRef(coordinates);
  const onSelectRef = useRef(onSelectEvent);
  const [ready, setReady] = useState(false);
  latestCoordinatesRef.current = coordinates;
  onSelectRef.current = onSelectEvent;

  useEffect(() => {
    if (!ref.current) return;
    const originPoint: [number, number] = [origin.longitude, origin.latitude];
    const destinationPoint: [number, number] = [destination.longitude, destination.latitude];
    const map = new maplibregl.Map({ container: ref.current, style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] }, center: originPoint, zoom: 10 });
    const eventMarkers = eventMarkersRef.current;
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => {
      const initialCoordinates = latestCoordinatesRef.current;
      map.addSource("track", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: initialCoordinates.length > 1 ? initialCoordinates : [] } } });
      map.addLayer({ id: "track", type: "line", source: "track", paint: { "line-color": "#093D77", "line-width": 5, "line-opacity": .85 } });
      [originPoint, destinationPoint].forEach((point, index) => { const element = document.createElement("span"); element.className = `route-point route-point--${index}`; new maplibregl.Marker({ element }).setLngLat(point).addTo(map); });
      const latestPoint = initialCoordinates.at(-1);
      if (latestPoint) {
        const element = document.createElement("span");
        element.className = "route-point route-point--2";
        currentMarkerRef.current = new maplibregl.Marker({ element }).setLngLat(latestPoint).addTo(map);
      }
      const bounds = new maplibregl.LngLatBounds(originPoint, originPoint).extend(destinationPoint);
      initialCoordinates.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { padding: 48, maxZoom: 14 });
      setReady(true);
    });
    return () => {
      eventMarkers.forEach((marker) => marker.remove());
      eventMarkers.clear();
      currentMarkerRef.current = null;
      mapRef.current = null;
      setReady(false);
      map.remove();
    };
  }, [destination.latitude, destination.longitude, origin.latitude, origin.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource("track") as maplibregl.GeoJSONSource | undefined;
    if (!map || !source) return;
    source.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coordinates.length > 1 ? coordinates : [] } });
    const latestPoint = coordinates.at(-1);
    if (!latestPoint) return;
    if (!currentMarkerRef.current) {
      const element = document.createElement("span");
      element.className = "route-point route-point--2";
      currentMarkerRef.current = new maplibregl.Marker({ element }).setLngLat(latestPoint).addTo(map);
    } else {
      currentMarkerRef.current.setLngLat(latestPoint);
    }
  }, [coordinates]);

  // Un marcador por alerta del viaje, con el ícono de su tipo; al tocarlo se selecciona el evento.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const markers = eventMarkersRef.current;
    const wanted = new Set(events.map((event) => event.id));
    markers.forEach((marker, id) => { if (!wanted.has(id)) { marker.remove(); markers.delete(id); } });
    events.forEach((event) => {
      const point: [number, number] = [event.longitude, event.latitude];
      const existing = markers.get(event.id);
      if (existing) { existing.setLngLat(point); existing.getPopup()?.setHTML(popupHtml(event)); return; }
      const element = document.createElement("button");
      element.type = "button";
      element.className = `event-marker event-marker--${event.type.toLowerCase()}${event.delayed ? " event-marker--delayed" : ""}`;
      element.textContent = EVENT_ICONS[event.type] ?? "🔔";
      element.title = event.title;
      element.setAttribute("aria-label", event.title);
      element.addEventListener("click", (click) => { click.stopPropagation(); onSelectRef.current?.(event.id); });
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: "260px" }).setHTML(popupHtml(event));
      markers.set(event.id, new maplibregl.Marker({ element }).setLngLat(point).setPopup(popup).addTo(map));
    });
  }, [events, ready]);

  // El evento seleccionado (desde la lista o el mapa) se resalta, el mapa va a su punto y abre el detalle.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    eventMarkersRef.current.forEach((marker, id) => {
      const selected = id === selectedEventId;
      marker.getElement().classList.toggle("event-marker--selected", selected);
      const popup = marker.getPopup();
      if (selected) {
        map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), 14), speed: 1.4 });
        if (popup && !popup.isOpen()) marker.togglePopup();
      } else if (popup?.isOpen()) {
        marker.togglePopup();
      }
    });
    // Solo cuando cambia la selección: un refresco de datos no tiene que mover el mapa.
  }, [selectedEventId, ready]);

  return <div ref={ref} className="route-map" />;
}
