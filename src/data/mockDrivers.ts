import type { Driver } from "@/types/domain";
export const mockDrivers: Driver[] = [
  { id:"DRV-001", firstName:"Juan", lastName:"Pérez", document:"45872103", license:"Q45872103", phone:"+51 987 321 654", status:"assigned", vehicle:"TRK-003", currentTrip:"VJ-2048" },
  { id:"DRV-002", firstName:"Lucía", lastName:"Ramos", document:"47210986", license:"Q47210986", phone:"+51 956 104 287", status:"available" },
  { id:"DRV-003", firstName:"Carlos", lastName:"Mendoza", document:"41028754", license:"Q41028754", phone:"+51 932 785 410", status:"assigned", vehicle:"TRK-018", currentTrip:"VJ-2046" },
  { id:"DRV-004", firstName:"Rosa", lastName:"Vega", document:"48653217", license:"Q48653217", phone:"+51 945 612 308", status:"inactive", vehicle:"TRK-021" },
];
