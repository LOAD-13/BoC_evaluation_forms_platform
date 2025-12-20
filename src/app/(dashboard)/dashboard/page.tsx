import StatsCard from "../_components/StatsCard";
import OverviewChart from "./_components/OverviewChart";
import RecentForms from "./_components/RecentForms";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            {/* Tarjetas de Estadísticas Superiores */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Formularios" value="12" icon="FileText" description="+2 este mes" />
                <StatsCard title="Total Respuestas" value="234" icon="Users" description="+18% este mes" />
                <StatsCard title="Promedio Notas" value="14.2" icon="BarChart" description="+4% vs mes anterior" />
                <StatsCard title="Activos Ahora" value="3" icon="Activity" description="+1 en la última hora" />
            </div>

            {/* Gráficos y Listas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <OverviewChart />
                <RecentForms />
            </div>
        </div>
    );
}