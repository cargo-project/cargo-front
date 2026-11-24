import { apiClient } from "./apiClient";
import type { ApiVehicle } from "@/types/api";
import type { FleetVehicle, VehicleOperationalStatus } from "@/types/domain";
import { relativeTime } from "@/utils/format";

export interface VehicleInput { code: string; plate: string; brand: string; model: string; description: string; status: VehicleOperationalStatus }

const adapt = (item: ApiVehicle): FleetVehicle => ({
  id: item.code,
  plate: item.plate,
  brand: item.brand,
  model: item.model,
  description: item.description,
  status: item.status,
  driver: item.currentDriver,
  currentTrip: item.currentTrip,
  lastSignal: relativeTime(item.lastSignalAt),
});

export const vehicleService = {
  async getVehicles() { return (await apiClient.get<ApiVehicle[]>("/vehicles")).map(adapt); },
  async createVehicle(input: VehicleInput) { return adapt(await apiClient.post<ApiVehicle>("/vehicles", input)); },
  async deleteVehicle(code: string) { await apiClient.delete(`/vehicles/${encodeURIComponent(code)}`); },
  async updateVehicle(code: string, input: VehicleInput) { return adapt(await apiClient.put<ApiVehicle>(`/vehicles/${encodeURIComponent(code)}`, input)); },
};
