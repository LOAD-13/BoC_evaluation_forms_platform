import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import StatsCard from "../_components/StatsCard";
import OverviewChart from "./_components/OverviewChart";
import RecentForms from "./_components/RecentForms";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const payload = await verifyJwt(token);
    if (!payload) redirect("/login");

    const userId = payload.id as string;

    // Fetch Data
    const totalForms = await prisma.form.count({
        where: { ownerId: userId },
    });

    const recentForms = await prisma.form.findMany({
        where: { ownerId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { responses: true },
            },
        },
    });

    // Calcular total de usuarios (Solo si es ADMIN)
    // Nota: Como estamos en dashboard general, asumimos que interesa ver todos si es admin
    const totalUsers = payload.role === 'ADMIN'
        ? await prisma.user.count()
        : 1; // Si es user normal, solo él mismo (o no mostramos la tarjeta)

    // Calcular respuestas de hoy
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const responsesToday = await prisma.response.count({
        where: {
            startedAt: {
                gte: startOfToday
            },
            // Si no es admin, filtrar por mis formularios
            ...(payload.role !== 'ADMIN' ? {
                form: { ownerId: userId }
            } : {})
        }
    });

    // Calcular datos para el gráfico (Últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const responsesLast7Days = await prisma.response.findMany({
        where: {
            startedAt: {
                gte: sevenDaysAgo
            },
            ...(payload.role !== 'ADMIN' ? {
                form: { ownerId: userId }
            } : {})
        },
        select: {
            startedAt: true
        }
    });

    // Agrupar por día
    const chartDataMap = new Map<string, number>();
    // Inicializar últimos 7 días con 0
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString("es-ES", { weekday: 'short' }); // Mar, Mié...
        chartDataMap.set(key, 0);
    }

    // Contar
    responsesLast7Days.forEach(r => {
        const key = r.startedAt.toLocaleDateString("es-ES", { weekday: 'short' });
        // Nota: Esto sobrescribe si el día se repite (ej: hace 1 año), pero filtramos por gte sevenDaysAgo
        // Mejor lógica sería usar YYYY-MM-DD para agrupar y luego formatear.
        // Simplificación para este MVP:
        if (chartDataMap.has(key)) {
            chartDataMap.set(key, (chartDataMap.get(key) || 0) + 1);
        }
    });

    // Convertir a array y revertir para orden cronológico
    const chartData = Array.from(chartDataMap).map(([name, total]) => ({ name, total })).reverse();

    // Calcular total de respuestas recibidas
    const totalResponses = await prisma.response.count({
        where: {
            form: {
                ownerId: userId
            }
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            {/* Tarjetas de Estadísticas Superiores */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Formularios"
                    value={totalForms.toString()}
                    icon="FileText"
                    description="Total de encuestas creadas"
                />
                {/* Mostrar Usuarios solo a Admin */}
                {payload.role === 'ADMIN' && (
                    <StatsCard
                        title="Total Usuarios"
                        value={totalUsers.toString()}
                        icon="Users"
                        description="Usuarios registrados"
                    />
                )}
                <StatsCard
                    title="Respuestas Hoy"
                    value={responsesToday.toString()}
                    icon="Activity"
                    description="Actividad diaria"
                />
                <StatsCard
                    title="Total Respuestas"
                    value={totalResponses.toString()}
                    icon="BarChart"
                    description="Histórico acumulado"
                />
            </div>

            {/* Gráficos y Listas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <OverviewChart data={chartData} />
                <RecentForms forms={recentForms} />
            </div>
        </div>
    );
}