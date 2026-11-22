export type DashboardStatTone = "primary" | "secondary" | "warning" | "danger";

export interface DashboardStat {
  id: string;
  title: string;
  value: number;
  description: string;
  tone: DashboardStatTone;
  icon: "truck" | "route" | "alert" | "offline";
}

export type ActivityType =
  | "POSITION_UPDATE"
  | "ROUTE_DEVIATION"
  | "PROLONGED_STOP"
  | "CONNECTION_LOSS"
  | "CONNECTION_RECOVERY"
  | "DESTINATION_ARRIVAL"
  | "EMERGENCY"
  | "TRIP_STARTED";

export interface RecentActivityItem {
  id: string;
  time: string;
  type: ActivityType;
  label: string;
  vehicleId: string;
}
