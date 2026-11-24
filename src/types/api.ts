import type { DeviceStatus, DeviceType, DriverStatus, EventType, TripStatus, VehicleOperationalStatus } from "./domain";

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "OPERATOR";
  telegramChatId?: string;
  isActive: boolean;
}

export interface ApiVehicle {
  id: string;
  code: string;
  plate: string;
  brand: string;
  model: string;
  description: string;
  status: VehicleOperationalStatus;
  currentDriver?: string;
  currentTrip?: string;
  lastSignalAt?: string;
}

export interface ApiDriver {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  document: string;
  license: string;
  phone: string;
  status: DriverStatus;
  vehicle?: string;
  currentTrip?: string;
}

export interface ApiDevice {
  id: string;
  code: string;
  type: DeviceType;
  serial: string;
  firmware: string;
  vehicleCode?: string;
  status: DeviceStatus;
  active: boolean;
  lastConnectionAt?: string;
}

export interface ApiRecipient {
  id: string;
  name: string;
  telegramChatId: string;
  active: boolean;
}

export interface Coordinates { latitude: number; longitude: number }

export interface ApiGeocodingResult extends Coordinates {
  id: string;
  displayName: string;
  category?: string;
  resultType?: string;
}

export interface ApiMonitoringConfig {
  routeDeviationMinEvents: number;
  routeDeviationMinIncreaseM: number;
  routeDeviationWindowSeconds: number;
  stopSpeedKmh: number;
  stopMaxDisplacementM: number;
  stopDurationSeconds: number;
  connectionLossSeconds: number;
  arrivalRadiusM: number;
  arrivalConfirmationSeconds: number;
  sequenceGapWaitSeconds: number;
}

export interface ApiTrip {
  id: string;
  code: string;
  vehicleCode: string;
  plate: string;
  driverCode: string;
  driverName: string;
  originLabel: string;
  origin: Coordinates;
  destinationLabel: string;
  destination: Coordinates;
  cargoDescription: string;
  status: TripStatus;
  plannedStartAt?: string;
  actualStartAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  progress: number;
  recipients: ApiRecipient[];
  monitoringConfig: ApiMonitoringConfig;
}

export interface ApiTelemetry {
  eventId: string;
  deviceCode: string;
  tripCode: string;
  sequenceNumber: number;
  eventTime: string;
  receivedAt: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  kind: "POSITION" | "EMERGENCY";
  retransmitted: boolean;
  distanceToDestinationM: number;
  insideArrivalArea: boolean;
}

export interface ApiMonitoringEvent {
  id: string;
  type: EventType;
  tripCode: string;
  vehicleCode: string;
  driverName: string;
  startedAt?: string;
  eventTime: string;
  detectedAt: string;
  latitude?: number;
  longitude?: number;
  description: string;
  details: Record<string, unknown>;
  status: "pending" | "reviewed";
  evidence: ApiTelemetry[];
}

export interface ApiDashboard {
  stats: { id: string; value: number }[];
  vehicles: {
    id: string; plate: string; driver: string; status: string; speed?: number;
    origin: string; destination: string; lastSignalAt?: string; latitude: number; longitude: number;
  }[];
  recentActivity: { id: string; time: string; type: string; vehicleId: string }[];
}

export interface ApiSettings {
  general: {
    organizationName: string; timezone: string; distanceUnit: "km" | "mi";
    defaultLanguage: "es" | "en"; telegramEnabled: boolean;
  };
  monitoring: ApiMonitoringConfig;
}

export interface ApiIntegrationHealth {
  key: string;
  name: string;
  status: "online" | "offline" | "unconfigured";
  detail: string;
}

export interface ApiTrack {
  type: "Feature";
  properties: { tripId: string; pointCount: number };
  geometry: { type: "LineString"; coordinates: [number, number][] };
}


export interface ApiAdminAccount {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "OPERATOR";
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  failedLoginsLastDay: number;
  lockedUntil?: string | null;
  telegramChatId?: string | null;
}

export interface ApiAdminOverview {
  generatedAt: string;
  accounts: ApiAdminAccount[];
  loginsLastDay: number;
  failedLoginsLastDay: number;
  fleet: { vehicles: number; drivers: number; devices: number; devicesOnline: number; activeTrips: number; totalTrips: number };
  telemetryLastDay: { total: number; live: number; delayed: number };
  eventsLastDay: Record<string, number>;
  eventsLastWeek: Record<string, number>;
  delayedEventsLastWeek: number;
  notificationsLastDay: { sent: number; failed: number; pending: number; skipped: number };
  outboxPending: number;
}

export interface ApiActivityEntry {
  id: string;
  occurredAt: string;
  action: string;
  entityType: string;
  entityId: string;
  actorEmail?: string | null;
  actorName?: string | null;
  details: Record<string, unknown>;
}
