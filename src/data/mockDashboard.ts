import type { DashboardStat, RecentActivityItem } from "@/types/dashboard";
import type { NotificationItem } from "@/types/notification";
import type { Vehicle } from "@/types/vehicle";

export const mockDashboardStats: DashboardStat[] = [
  { id: "active", title: "Vehículos activos", value: 42, description: "88% de la flota", tone: "primary", icon: "truck" },
  { id: "trips", title: "Viajes en curso", value: 18, description: "6 próximos a destino", tone: "secondary", icon: "route" },
  { id: "alerts", title: "Alertas críticas", value: 3, description: "Requieren atención", tone: "danger", icon: "alert" },
  { id: "offline", title: "Dispositivos fuera de línea", value: 7, description: "Últimas 24 horas", tone: "warning", icon: "offline" },
];

export const mockVehicles: Vehicle[] = [
  { id: "TRK-003", plate: "ABC-123", driver: "Juan Pérez", status: "En ruta", speed: 78, origin: "Lima", destination: "Ica", lastSignal: "hace 12 s", latitude: -12.0942, longitude: -77.0352 },
  { id: "TRK-011", plate: "F6T-428", driver: "Lucía Ramos", status: "Detenido", speed: 0, origin: "Callao", destination: "Chincha", lastSignal: "hace 2 min", latitude: -12.0478, longitude: -77.1058 },
  { id: "TRK-018", plate: "B9K-672", driver: "Carlos Mendoza", status: "Alerta", speed: 42, origin: "Ica", destination: "Lima", lastSignal: "hace 3 min", latitude: -12.1687, longitude: -76.9714 },
  { id: "TRK-021", plate: "D3R-519", driver: "Rosa Vega", status: "En ruta", speed: 64, origin: "Lima", destination: "Huacho", lastSignal: "hace 4 min", latitude: -11.9768, longitude: -77.0584 },
];

export const mockRecentActivity: RecentActivityItem[] = [
  { id: "a1", time: "10:42", type: "POSITION_UPDATE", label: "Posición actualizada", vehicleId: "TRK-003" },
  { id: "a2", time: "10:35", type: "DESTINATION_ARRIVAL", label: "Llegada al destino", vehicleId: "TRK-011" },
  { id: "a3", time: "10:28", type: "ROUTE_DEVIATION", label: "Posible desviación detectada", vehicleId: "TRK-018" },
  { id: "a4", time: "10:15", type: "CONNECTION_RECOVERY", label: "Comunicación recuperada", vehicleId: "TRK-021" },
];

export const mockNotifications: NotificationItem[] = [
  { id: "n1", title: "Posible desviación", message: "TRK-018 requiere revisión.", time: "Hace 3 min", unread: true },
  { id: "n2", title: "Comunicación recuperada", message: "TRK-021 volvió a transmitir.", time: "Hace 15 min", unread: true },
  { id: "n3", title: "Llegada al destino", message: "TRK-011 llegó a Chincha.", time: "Hace 28 min", unread: false },
];
