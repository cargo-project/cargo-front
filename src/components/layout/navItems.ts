import { Bell, Cpu, LayoutDashboard, PlusCircle, Route, Settings, Truck, Users } from "lucide-react";
export const NAV_ITEMS = [
  { labelKey: "nav.home", href: "/home", icon: LayoutDashboard }, { labelKey: "nav.vehicles", href: "/vehiculos", icon: Truck },
  { labelKey: "nav.trips", href: "/viajes", icon: Route }, { labelKey: "nav.createTrip", href: "/viajes/crear", icon: PlusCircle },
  { labelKey: "nav.alerts", href: "/alertas", icon: Bell }, { labelKey: "nav.devices", href: "/dispositivos", icon: Cpu },
  { labelKey: "nav.drivers", href: "/conductores", icon: Users }, { labelKey: "nav.settings", href: "/configuracion", icon: Settings },
] as const;
