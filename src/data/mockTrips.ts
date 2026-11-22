import type { Trip } from "@/types/domain";
export const mockTrips: Trip[] = [
  { id:"VJ-2048", vehicleId:"TRK-003", plate:"ABC-123", origin:"Lima", destination:"Ica", driver:"Juan Pérez", cargo:"Productos industriales", status:"ongoing", start:"04/10/2026 08:30", progress:64 },
  { id:"VJ-2047", vehicleId:"TRK-011", plate:"F6T-428", origin:"Callao", destination:"Chincha", driver:"Lucía Ramos", cargo:"Carga general", status:"configured", start:"04/10/2026 14:00", progress:0 },
  { id:"VJ-2046", vehicleId:"TRK-018", plate:"B9K-672", origin:"Ica", destination:"Lima", driver:"Carlos Mendoza", cargo:"Insumos agrícolas", status:"ongoing", start:"04/10/2026 06:15", progress:42 },
  { id:"VJ-2045", vehicleId:"TRK-021", plate:"D3R-519", origin:"Lima", destination:"Huacho", driver:"Rosa Vega", cargo:"Repuestos", status:"completed", start:"03/10/2026 09:20", progress:100 },
  { id:"VJ-2044", vehicleId:"TRK-026", plate:"A7P-340", origin:"Lima", destination:"Cañete", driver:"Miguel Soto", cargo:"Materiales", status:"cancelled", start:"02/10/2026 11:00", progress:12 },
];
