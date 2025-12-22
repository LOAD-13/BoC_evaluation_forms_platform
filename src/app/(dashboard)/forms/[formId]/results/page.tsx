import { prisma } from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import Link from "next/link"
import { AssignmentStatus, STATUS_LABELS } from "@/lib/constants/statusTypes"
import { PieChart } from "@/components/charts/PieChart"
import { BarChart } from "@/components/charts/BarChart"
// [NUEVO] 1. Importamos el componente de tabla reutilizable
import ResultsTable from "../../_components/ResultsTable"

// Helper para convertir variantes
function getBadgeClass(status: string) {
    if (status === AssignmentStatus.COMPLETED) return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
    if (status === AssignmentStatus.PENDING) return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
    return "";
}

export default async function FormResultsPage({ params }: { params: Promise<{ formId: string }> }) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) redirect("/login")

    const payload = await verifyJwt(token)
    if (!payload) redirect("/login")

    const { formId } = await params

    // 1. Fetch Form basic info
    const form = await prisma.form.findUnique({
        where: { id: formId },
        select: { title: true, ownerId: true }
    })

    if (!form || form.ownerId !== payload.id) {
        return <div>No autorizado o no encontrado</div>
    }

    // 2. Fetch Assignments (Lista de estudiantes asignados)
    const assignments = await prisma.assignment.findMany({
        where: { formId: formId },
        include: {
            user: { select: { id: true, fullName: true, email: true } }
        }
    })

    // 3. Fetch Responses (Todas las respuestas, incluyendo anónimos)
    const responses = await prisma.response.findMany({
        where: {
            formId: formId,
            finishedAt: { not: null }
        },
        include: {
            evaluation: true,
            user: { select: { id: true, fullName: true, email: true } }
        },
        orderBy: { finishedAt: 'desc' } // Ordenar por más reciente
    })

    // --- CÁLCULO DE ESTADÍSTICAS GENERALES ---
    const totalResponsesCount = responses.length;
    const passedCount = responses.filter(r => r.evaluation?.passed).length;
    const failedCount = totalResponsesCount - passedCount;

    const pieData = [
        { name: "Aprobados", value: passedCount, color: "#22c55e" },
        { name: "Reprobados", value: failedCount, color: "#ef4444" },
    ];

    const distribution = [0, 0, 0, 0, 0];
    let sumGlobalScores = 0;

    responses.forEach(r => {
        const score = Number(r.evaluation?.totalScore) || 0;
        sumGlobalScores += score;

        if (score <= 4) distribution[0]++;
        else if (score <= 8) distribution[1]++;
        else if (score <= 12) distribution[2]++;
        else if (score <= 16) distribution[3]++;
        else distribution[4]++;
    });

    const barData = [
        { name: "0-4", value: distribution[0] },
        { name: "5-8", value: distribution[1] },
        { name: "9-12", value: distribution[2] },
        { name: "13-16", value: distribution[3] },
        { name: "17-20", value: distribution[4] },
    ];

    const averageGlobalScore = totalResponsesCount > 0 ? (sumGlobalScores / totalResponsesCount).toFixed(1) : "0";

    // --- PREPARAR DATOS PARA LA TABLA DE ESTUDIANTES (Asignados) ---
    const responseMap = new Map();
    responses.forEach(r => {
        if (r.userId) responseMap.set(r.userId, r);
    });

    const totalAssigned = assignments.length;
    let completedFromAssigned = 0;

    const studentsData = assignments.map(a => {
        const response = responseMap.get(a.userId);
        const hasResponse = !!response;

        let status = AssignmentStatus.PENDING;
        let score = 0;
        let maxScore = 0;
        let passed = false;

        if (hasResponse) {
            status = AssignmentStatus.COMPLETED;
            completedFromAssigned++;
            if (response.evaluation) {
                score = Number(response.evaluation.totalScore);
                maxScore = Number(response.evaluation.maxScore);
                passed = response.evaluation.passed;
            }
        }

        return {
            user: a.user,
            status,
            score,
            maxScore,
            passed,
            responseId: response?.id,
            evaluatedAt: response?.evaluation?.evaluatedAt
        }
    })

    return (
        <div className="space-y-12 pb-20"> {/* Aumentado el espacio vertical */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resultados: {form.title}</h1>
                    <p className="text-muted-foreground">Resumen global de calificaciones.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageGlobalScore} pts</div>
                        <p className="text-xs text-muted-foreground">
                            Basado en {totalResponsesCount} respuestas totales
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {totalResponsesCount > 0 ? Math.round((passedCount / totalResponsesCount) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {passedCount} aprobados de {totalResponsesCount}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avance de Asignados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedFromAssigned} / {totalAssigned}</div>
                        <p className="text-xs text-muted-foreground">
                            Estudiantes registrados que completaron
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Aprobados vs Reprobados</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {totalResponsesCount > 0 ? <PieChart data={pieData} /> : <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos</div>}
                    </CardContent>
                </Card>
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Distribución de Notas</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {totalResponsesCount > 0 ? <BarChart data={barData} /> : <div className="h-full flex items-center justify-center text-muted-foreground">Sin datos</div>}
                    </CardContent>
                </Card>
            </div>

            {/* TABLA 1: Estudiantes Asignados (Tu tabla original) */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">1. Seguimiento de Estudiantes Asignados</h2>
                <div className="border rounded-md bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Calificación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No hay estudiantes asignados manualmente.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                studentsData.map((item) => (
                                    <TableRow key={item.user.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.user.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{item.user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getBadgeClass(item.status)}>
                                                {STATUS_LABELS[item.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.evaluatedAt ? new Date(item.evaluatedAt).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>
                                            {item.status === AssignmentStatus.COMPLETED ? (
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${item.passed ? "text-green-600" : "text-red-600"}`}>
                                                        {item.score} / {item.maxScore}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.responseId && (
                                                <Link href={`/forms/${formId}/results/${item.responseId}`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="h-4 w-4 mr-2" /> Ver Examen
                                                    </Button>
                                                </Link>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* TABLA 2: [NUEVO] Historial Completo (Aquí aparecen los anónimos) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">2. Historial Completo de Respuestas</h2>
                    <Badge variant="secondary">Incluye Anónimos</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Aquí se muestran todas las respuestas recibidas, incluyendo usuarios no asignados e invitados.
                </p>
                {/* Usamos el componente ResultsTable que ya sabe manejar usuarios nulos */}
                <ResultsTable data={responses} />
            </div>
        </div>
    )
}