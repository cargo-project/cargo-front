import { apiClient } from "./apiClient";
import type { ApiDashboard } from "@/types/api";
import type { DashboardStat, RecentActivityItem } from "@/types/dashboard";
import type { Vehicle, VehicleStatus } from "@/types/vehicle";
import { relativeTime } from "@/utils/format";

const statMeta: Record<string, Omit<DashboardStat, "id" | "value">> = {
  active: { title: "Vehículos", description: "Unidades registradas", tone: "primary", icon: "truck" },
  trips: { title: "Recorridos activos", description: "Monitoreo en curso", tone: "secondary", icon: "route" },
  alerts: { title: "Alertas pendientes", description: "Requieren revisión", tone: "warning", icon: "alert" },
  offline: { title: "Sin conexión", description: "Dispositivos desconectados", tone: "danger", icon: "offline" },
};
const status = (value: string): VehicleStatus => value === "Detenido" ? "Detenido" : value === "Alerta" ? "Alerta" : value === "Sin conexión" ? "Sin conexión" : "En ruta";
export const dashboardService = {
  async getDashboard() {
    const data = await apiClient.get<ApiDashboard>("/dashboard");
    return {
      stats: data.stats.map((item) => ({ id: item.id, value: item.value, ...(statMeta[item.id] ?? statMeta.active) })),
      vehicles: data.vehicles.map((item): Vehicle => ({ ...item, speed: item.speed === undefined ? undefined : Math.round(item.speed * 10) / 10, status: status(item.status), lastSignal: relativeTime(item.lastSignalAt) })),
      activity: data.recentActivity.map((item): RecentActivityItem => ({ id: item.id, time: relativeTime(item.time), type: item.type as RecentActivityItem["type"], label: item.type, vehicleId: item.vehicleId })),
    };
  },
};
