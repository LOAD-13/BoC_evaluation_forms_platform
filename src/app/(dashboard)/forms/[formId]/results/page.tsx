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
import { AssignmentStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/statusTypes"

// Helper para convertir variantes de nuestro enum a shadcn badge variants
function getBadgeVariant(status: string) {
    const color = STATUS_COLORS[status];
    if (color === 'success') return 'default'; // Greenish usually default or we can style it
    if (color === 'destructive') return 'destructive';
    if (color === 'secondary') return 'secondary';
    return 'outline';
}

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

    // 2. Fetch Assignments (Lista de estudiantes que DEBEN tomarlo)
    const assignments = await prisma.assignment.findMany({
        where: { formId: formId },
        include: {
            user: { select: { id: true, fullName: true, email: true } }
        }
    })

    // 3. Fetch Responses (Resultados reales)
    const responses = await prisma.response.findMany({
        where: { formId: formId },
        include: {
            evaluation: true,
            details: false // No necesitamos detalles aquí, solo nota final
        }
    })

    // 4. Merge Data & Calculate Stats
    const totalAssigned = assignments.length
    let totalCompleted = 0
    let sumScores = 0

    // Mapa rápido de respuestas por usuario para cruzar datos
    const responseMap = new Map();
    responses.forEach(r => {
        if (r.userId) responseMap.set(r.userId, r);
    });

    const studentsData = assignments.map(a => {
        const response = responseMap.get(a.userId);
        const hasResponse = !!response;

        let status = AssignmentStatus.PENDING;
        let score = 0;
        let maxScore = 0;
        let passed = false;

        if (hasResponse) {
            status = AssignmentStatus.COMPLETED;
            totalCompleted++;
            if (response.evaluation) {
                // Convert Decimal to number for stats
                const s = Number(response.evaluation.totalScore)
                score = s;
                maxScore = Number(response.evaluation.maxScore);
                sumScores += s;
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

    const averageScore = totalCompleted > 0 ? (sumScores / totalCompleted).toFixed(1) : "0"

    return (
        <div className="space-y-8">
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
                        <div className="text-2xl font-bold">{averageScore} pts</div>
                        <p className="text-xs text-muted-foreground">
                            Calculado sobre {totalCompleted} exámenes finalizados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asignados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAssigned}</div>
                        <p className="text-xs text-muted-foreground">
                            Usuarios totales en este curso
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCompleted}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0}% de tasa de finalización
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Students Table */}
            <div className="border rounded-md">
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
                        {studentsData.map((item) => (
                            <TableRow key={item.user.id}>
                                <TableCell>
                                    <div className="font-medium">{item.user.fullName}</div>
                                    <div className="text-xs text-muted-foreground">{item.user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={getBadgeClass(item.status)}
                                    >
                                        {STATUS_LABELS[item.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {item.evaluatedAt ? new Date(item.evaluatedAt).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    {item.status === AssignmentStatus.COMPLETED ? (
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${item.passed ? "text-green-600" : "text-red-600"}`}>
                                                {item.score} / {item.maxScore}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                                {item.passed ? "Aprobado" : "Reprobado"}
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
