import { apiClient } from "./apiClient";
import type { ApiTrack, ApiTrip, Coordinates } from "@/types/api";
import type { Trip } from "@/types/domain";
import { formatDateTime } from "@/utils/format";

export interface TripCreateInput {
  vehicleCode: string; driverCode: string; originLabel: string; origin: Coordinates;
  destinationLabel: string; destination: Coordinates; cargoDescription: string;
  plannedStartAt?: string; recipientIds: string[];
}
const adapt = (item: ApiTrip): Trip => ({ id: item.code, vehicleId: item.vehicleCode, plate: item.plate, origin: item.originLabel, destination: item.destinationLabel, driver: item.driverName, cargo: item.cargoDescription, status: item.status, start: formatDateTime(item.actualStartAt ?? item.plannedStartAt), progress: item.progress });
export const tripService = {
  adapt,
  async getTrips() { return (await apiClient.get<ApiTrip[]>("/trips")).map(adapt); },
  async getTrip(code: string) { return apiClient.get<ApiTrip>(`/trips/${encodeURIComponent(code)}`); },
  async createTrip(input: TripCreateInput) { return apiClient.post<ApiTrip>("/trips", input); },
  async start(code: string) { return apiClient.post<ApiTrip>(`/trips/${encodeURIComponent(code)}/start`); },
  async cancel(code: string) { return apiClient.post<ApiTrip>(`/trips/${encodeURIComponent(code)}/cancel`); },
  async getTrack(code: string) { return apiClient.get<ApiTrack>(`/trips/${encodeURIComponent(code)}/track`); },
};
