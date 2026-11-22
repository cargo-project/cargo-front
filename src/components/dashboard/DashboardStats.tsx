import type { DashboardStat as DashboardStatType } from "@/types/dashboard";
import { StatCard } from "./StatCard";
import { useLanguage } from "@/i18n/LanguageContext";
export function DashboardStats({ stats }: { stats: DashboardStatType[] }) { const {language}=useLanguage(); return <section className="stats-grid" aria-label={language==="es"?"Indicadores de operación":"Operation metrics"}>{stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}</section>; }
