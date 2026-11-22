export type VehicleStatus = "En ruta" | "Detenido" | "Alerta" | "Sin conexión";

export interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  status: VehicleStatus;
  speed?: number;
  origin: string;
  destination: string;
  lastSignal: string;
  latitude: number;
  longitude: number;
}
