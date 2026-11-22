import type { IoTDevice } from "@/types/domain";
export const mockDevices: IoTDevice[] = [
  { id:"DEV-GW-003", type:"Edge Gateway", serial:"EGW-PE-90231", vehicle:"TRK-003", firmware:"2.4.1", lastConnection:"12 s", status:"online", active:true },
  { id:"DEV-GNSS-011", type:"GNSS", serial:"GNS-88420", vehicle:"TRK-011", firmware:"1.9.0", lastConnection:"2 min", status:"online", active:true },
  { id:"DEV-GW-018", type:"Edge Gateway", serial:"EGW-PE-90244", vehicle:"TRK-018", firmware:"2.3.8", lastConnection:"14 min", status:"offline", active:true },
  { id:"DEV-GNSS-029", type:"GNSS", serial:"GNS-88501", firmware:"1.9.0", lastConnection:"Nunca", status:"inactive", active:false },
];
