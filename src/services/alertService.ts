import { apiClient } from "./apiClient";
import type { ApiMonitoringEvent } from "@/types/api";
import type { MonitoringEvent } from "@/types/domain";
import { formatDateTime } from "@/utils/format";

const adapt = (item: ApiMonitoringEvent): MonitoringEvent => {
  const hasPosition = item.latitude != null && item.longitude != null;
  // Lo que pasó sin señal se muestra con la hora en que ocurrió, no con la de detección.
  const delayed = item.details?.delayed === true && item.type !== "EMERGENCY";
  return {
    id: item.id, type: item.type, vehicleId: item.vehicleCode, tripId: item.tripCode, driver: item.driverName,
    date: formatDateTime(delayed ? (item.startedAt ?? item.eventTime) : item.detectedAt), status: item.status,
    position: hasPosition ? `${item.latitude!.toFixed(5)}, ${item.longitude!.toFixed(5)}` : "—",
    description: item.description,
    evidence: item.evidence.map((event) => `${formatDateTime(event.eventTime)} · #${event.sequenceNumber} · ${event.speedKmh.toFixed(1)} km/h`),
    latitude: hasPosition ? item.latitude : undefined, longitude: hasPosition ? item.longitude : undefined, delayed,
  };
};
export const alertService = {
  async getAlerts() { return (await apiClient.get<ApiMonitoringEvent[]>("/events")).map(adapt); },
  async getTripAlerts(code: string) { return (await apiClient.get<ApiMonitoringEvent[]>(`/events?trip_code=${encodeURIComponent(code)}`)).map(adapt); },
  async review(id: string) { return adapt(await apiClient.patch<ApiMonitoringEvent>(`/events/${id}/review`)); },
};
