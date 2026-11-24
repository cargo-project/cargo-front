import { Bell, Cpu, LayoutDashboard, PlusCircle, Route, ScrollText, Settings, ShieldCheck, Truck, UserCog, Users } from "lucide-react";
export const NAV_ITEMS = [
  { labelKey: "nav.home", href: "/home", icon: LayoutDashboard }, { labelKey: "nav.vehicles", href: "/vehiculos", icon: Truck },
  { labelKey: "nav.trips", href: "/viajes", icon: Route }, { labelKey: "nav.createTrip", href: "/viajes/crear", icon: PlusCircle },
  { labelKey: "nav.alerts", href: "/alertas", icon: Bell }, { labelKey: "nav.devices", href: "/dispositivos", icon: Cpu },
  { labelKey: "nav.drivers", href: "/conductores", icon: Users }, { labelKey: "nav.settings", href: "/configuracion", icon: Settings },
] as const;

/** Solo para el rol ADMIN (dueño de la plataforma). */
export const ADMIN_NAV_ITEMS = [
  { labelKey: "nav.adminOverview", href: "/admin", icon: ShieldCheck }, { labelKey: "nav.adminUsers", href: "/admin/usuarios", icon: UserCog },
  { labelKey: "nav.adminActivity", href: "/admin/actividad", icon: ScrollText },
] as const;
