import type { FleetVehicle } from "@/types/domain";
export const mockFleetVehicles: FleetVehicle[] = [
  { id:"TRK-003", plate:"ABC-123", brand:"Volvo", model:"FH 540", description:"Tracto de carga pesada", status:"onRoute", driver:"Juan Pérez", currentTrip:"VJ-2048", lastSignal:"12 s" },
  { id:"TRK-011", plate:"F6T-428", brand:"Scania", model:"R 450", description:"Unidad de distribución", status:"available", lastSignal:"2 min" },
  { id:"TRK-018", plate:"B9K-672", brand:"Mercedes-Benz", model:"Actros", description:"Tracto de larga distancia", status:"stopped", driver:"Carlos Mendoza", currentTrip:"VJ-2046", lastSignal:"3 min" },
  { id:"TRK-021", plate:"D3R-519", brand:"International", model:"LT", description:"Unidad de carga general", status:"offline", driver:"Rosa Vega", lastSignal:"14 min" },
  { id:"TRK-026", plate:"A7P-340", brand:"Volvo", model:"FMX", description:"Unidad en revisión técnica", status:"maintenance", lastSignal:"1 h" },
];
