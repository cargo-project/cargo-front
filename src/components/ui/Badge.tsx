import type { VehicleStatus } from "@/types/vehicle";
import { useLanguage } from "@/i18n/LanguageContext";
export function Badge({ status }: { status: VehicleStatus }) { const {language}=useLanguage(); const slug: Record<VehicleStatus, string> = { "En ruta": "route", Detenido: "stopped", Alerta: "alert", "Sin conexión": "offline" }; const en:Record<VehicleStatus,string>={"En ruta":"On route",Detenido:"Stopped",Alerta:"Alert","Sin conexión":"Offline"}; return <span className={`badge badge--${slug[status]}`}><span aria-hidden="true" />{language==="es"?status:en[status]}</span>; }
