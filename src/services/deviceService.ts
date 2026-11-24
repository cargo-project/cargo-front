import { apiClient } from "./apiClient";
import type { ApiDevice } from "@/types/api";
import type { DeviceStatus, DeviceType, IoTDevice } from "@/types/domain";
import { relativeTime } from "@/utils/format";

export interface DeviceInput { code: string; type: DeviceType; serial: string; firmware: string; vehicleCode?: string; status: DeviceStatus; active: boolean }
const adapt = (item: ApiDevice): IoTDevice => ({ id: item.code, type: item.type, serial: item.serial, firmware: item.firmware, vehicle: item.vehicleCode, status: item.status, active: item.active, lastConnection: relativeTime(item.lastConnectionAt) });
export const deviceService = {
  async getDevices() { return (await apiClient.get<ApiDevice[]>("/devices")).map(adapt); },
  async createDevice(input: DeviceInput) { return adapt(await apiClient.post<ApiDevice>("/devices", input)); },
  async deleteDevice(code: string) { await apiClient.delete(`/devices/${encodeURIComponent(code)}`); },
  async updateDevice(code: string, input: DeviceInput) { return adapt(await apiClient.put<ApiDevice>(`/devices/${encodeURIComponent(code)}`, input)); },
};
