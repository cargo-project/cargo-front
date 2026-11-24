import { apiClient } from "./apiClient";
import type { ApiDriver } from "@/types/api";
import type { Driver, DriverStatus } from "@/types/domain";

export interface DriverInput { code?: string; firstName: string; lastName: string; document: string; license: string; phone: string; status: DriverStatus }
const adapt = (item: ApiDriver): Driver => ({ id: item.code, firstName: item.firstName, lastName: item.lastName, document: item.document, license: item.license, phone: item.phone, status: item.status, vehicle: item.vehicle, currentTrip: item.currentTrip });
export const driverService = {
  async getDrivers() { return (await apiClient.get<ApiDriver[]>("/drivers")).map(adapt); },
  async createDriver(input: DriverInput) { return adapt(await apiClient.post<ApiDriver>("/drivers", input)); },
  async deleteDriver(code: string) { await apiClient.delete(`/drivers/${encodeURIComponent(code)}`); },
  async updateDriver(code: string, input: DriverInput) { return adapt(await apiClient.put<ApiDriver>(`/drivers/${encodeURIComponent(code)}`, input)); },
};
