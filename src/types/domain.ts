export type VehicleOperationalStatus = "available" | "onRoute" | "stopped" | "maintenance" | "offline";
export type DriverStatus = "available" | "assigned" | "inactive";
export type TripStatus = "configured" | "ongoing" | "completed" | "cancelled";
export type DeviceStatus = "online" | "offline" | "inactive";
export type DeviceType = "Edge Gateway" | "GNSS";
export type EventType = "ROUTE_DEVIATION" | "PROLONGED_STOP" | "CONNECTION_LOSS" | "CONNECTION_RECOVERY" | "DESTINATION_ARRIVAL" | "EMERGENCY" | "TRIP_STARTED";

export interface FleetVehicle { id: string; plate: string; brand: string; model: string; description: string; status: VehicleOperationalStatus; driver?: string; currentTrip?: string; lastSignal: string; }
export interface Driver { id: string; firstName: string; lastName: string; document: string; license: string; phone: string; status: DriverStatus; vehicle?: string; currentTrip?: string; }
export interface Trip { id: string; vehicleId: string; plate: string; origin: string; destination: string; driver: string; cargo: string; status: TripStatus; start: string; progress: number; }
export interface IoTDevice { id: string; type: DeviceType; serial: string; vehicle?: string; firmware: string; lastConnection: string; status: DeviceStatus; active: boolean; }
export interface MonitoringEvent { id: string; type: EventType; vehicleId: string; tripId: string; driver: string; date: string; status: "pending" | "reviewed"; position: string; description: string; evidence: string[]; latitude?: number; longitude?: number; delayed?: boolean; }
export interface User { id: string; name: string; telegramChatId?: string; configured: boolean; }
export interface TripRecipient { userId: string; selected: boolean; }
