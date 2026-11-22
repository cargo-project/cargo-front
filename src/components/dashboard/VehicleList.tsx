import { Truck } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { VehicleListItem } from "./VehicleListItem";
import { useLanguage } from "@/i18n/LanguageContext";
export function VehicleList({ vehicles, selectedId, onSelect }: { vehicles: Vehicle[]; selectedId: string; onSelect: (id: string) => void }) { const {t}=useLanguage(); return <aside className="units-panel"><div className="section-heading"><div><span className="eyebrow"><Truck size={15} /> {t("dashboard.monitoring")}</span><h2>{t("dashboard.units")}</h2></div><span className="live-label"><span />{t("dashboard.live")}</span></div><div className="vehicle-list">{vehicles.map((vehicle) => <VehicleListItem key={vehicle.id} vehicle={vehicle} selected={selectedId === vehicle.id} onSelect={onSelect} />)}</div></aside>; }
