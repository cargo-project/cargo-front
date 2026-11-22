import { AlertTriangle, RadioTower, Route, Truck } from "lucide-react";
import type { DashboardStat } from "@/types/dashboard";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/i18n/LanguageContext";

const ICONS = { truck: Truck, route: Route, alert: AlertTriangle, offline: RadioTower };

export function StatCard({ stat }: { stat: DashboardStat }) {
  const { language } = useLanguage();
  const Icon = ICONS[stat.icon];
  const english:Record<string,[string,string]>={active:["Active vehicles","88% of fleet"],trips:["Trips in progress","6 near destination"],alerts:["Critical alerts","Require attention"],offline:["Offline devices","Last 24 hours"]};
  const [title,description]=language==="en"?english[stat.id]:[stat.title,stat.description];
  return <Card className={`stat-card stat-card--${stat.tone}`}><div className="stat-card__icon"><Icon size={22} /></div><div><p>{title}</p><strong>{stat.value}</strong><small>{description}</small></div></Card>;
}
