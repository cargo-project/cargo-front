"use client";

import { ArrowLeft, Clock3, MapPin, Play, Truck, UserRound, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { tripService } from "@/services/tripService";
import { alertService } from "@/services/alertService";
import type { ApiTrack, ApiTrip } from "@/types/api";
import type { MonitoringEvent } from "@/types/domain";
import { formatDateTime } from "@/utils/format";
import { useRealtime } from "@/hooks/useRealtime";
import { AsyncState } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { RouteMap, type RouteMapEvent } from "./RouteMap";

export function TripDetailPage({ id }: { id: string }) {
  const { t } = useLanguage();
  const [trip, setTrip] = useState<ApiTrip>(); const [track, setTrack] = useState<ApiTrack>(); const [events, setEvents] = useState<MonitoringEvent[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { const [tripData, trackData, eventData] = await Promise.all([tripService.getTrip(id), tripService.getTrack(id), alertService.getTripAlerts(id)]); setTrip(tripData); setTrack(trackData); setEvents(eventData); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo cargar el recorrido."); } finally { setLoading(false); } }, [id]);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  // Las alertas con ubicación se dibujan en el mapa; la lista y el mapa comparten la selección.
  const mapEvents = useMemo<RouteMapEvent[]>(() => events.flatMap((event) => event.latitude != null && event.longitude != null
    ? [{ id: event.id, type: event.type, latitude: event.latitude, longitude: event.longitude, title: t(`event.${event.type}` as never), date: event.date, description: event.description, delayed: event.delayed, delayedLabel: t("event.delayed" as never) }]
    : []), [events, t]);
  const positionTimer = useRef<number | undefined>(undefined);
  const refreshPosition = useCallback(async () => {
    try {
      const [tripData, trackData] = await Promise.all([tripService.getTrip(id), tripService.getTrack(id)]);
      setTrip(tripData);
      setTrack(trackData);
    } catch { /* Keep the last valid realtime state; the next event retries. */ }
  }, [id]);
  const refreshEvent = useCallback(async () => {
    try {
      const [tripData, eventData] = await Promise.all([tripService.getTrip(id), alertService.getTripAlerts(id)]);
      setTrip(tripData);
      setEvents(eventData);
    } catch { /* Keep the last valid realtime state; the next event retries. */ }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => { if (positionTimer.current) window.clearTimeout(positionTimer.current); }, []);
  useRealtime((message) => {
    if (message.tripId !== id) return;
    if (message.type === "position.updated") {
      if (positionTimer.current) window.clearTimeout(positionTimer.current);
      positionTimer.current = window.setTimeout(() => void refreshPosition(), 250);
    } else if (message.type === "monitoring.event_created") {
      void refreshEvent();
    }
  });
  const transition = async (action: "start" | "cancel") => { if (!trip) return; try { setTrip(action === "start" ? await tripService.start(trip.code) : await tripService.cancel(trip.code)); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar el recorrido."); } };
  if (loading || error || !trip) return <div className="module-page"><AsyncState loading={loading} error={error} empty={!loading && !error} onRetry={() => void load()} /></div>;
  const start = formatDateTime(trip.actualStartAt ?? trip.plannedStartAt);
  return <div className="module-page"><Link className="back-link" href="/viajes"><ArrowLeft size={17} />{t("trips.title")}</Link><header className="trip-hero card"><div><span className="eyebrow">{t("trips.detail")}</span><h1>{trip.code}</h1><p>{trip.originLabel} → {trip.destinationLabel}</p></div><div className="trip-actions"><StatusPill status={trip.status} />{trip.status === "configured" && <Button onClick={() => void transition("start")}><Play size={16} />Iniciar</Button>}{["configured", "ongoing"].includes(trip.status) && <Button variant="secondary" onClick={() => void transition("cancel")}><XCircle size={16} />Cancelar</Button>}</div></header><div className="trip-facts">{[[Truck, t("common.vehicle"), `${trip.vehicleCode} · ${trip.plate}`], [UserRound, t("common.driver"), trip.driverName], [MapPin, t("trips.cargo"), trip.cargoDescription], [Clock3, t("trips.startDate"), start]].map(([Icon, label, value]) => <div className="card fact-card" key={String(label)}><Icon size={20} /><span><small>{String(label)}</small><strong>{String(value)}</strong></span></div>)}</div><div className="trip-detail-grid"><section className="card route-section"><div className="section-heading"><div><span className="eyebrow">GNSS</span><h2>{t("trips.realRoute")}</h2></div><span className="live-label"><span />{t("trips.currentLocation")}</span></div><RouteMap coordinates={track?.geometry.coordinates ?? []} origin={trip.origin} destination={trip.destination} events={mapEvents} selectedEventId={selectedEventId} onSelectEvent={setSelectedEventId} /></section><section className="card timeline-section"><div className="section-heading"><h2>{t("trips.timeline")}</h2></div>{mapEvents.length > 0 && <p className="timeline-hint">{t("trips.selectEventHint" as never)}</p>}<div className="timeline"><div><span /><small>{start}</small><strong>{t(`status.${trip.status}` as never)}</strong></div>{events.map((event) => { const onMap = event.latitude != null && event.longitude != null; const selected = event.id === selectedEventId; const content = <><span /><small>{event.date}</small><strong>{t(`event.${event.type}` as never)}</strong>{event.delayed && <em className="timeline-tag">{t("event.delayed" as never)}</em>}<p>{onMap ? event.position : t("trips.noEventLocation" as never)}</p></>; return onMap ? <button type="button" key={event.id} className={`timeline-item timeline-item--${event.type.toLowerCase()}${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={() => setSelectedEventId(event.id)}>{content}</button> : <div key={event.id} className={`timeline-item timeline-item--${event.type.toLowerCase()}`}>{content}</div>; })}</div></section></div></div>;
}
