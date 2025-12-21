"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, BarChart2, Eye, PlayCircle, CheckCircle, Share2, AlertCircle } from "lucide-react"
import { FormStatus, AssignmentStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/statusTypes"

interface FormCardProps {
    form: any; // Se podría usar el tipo Form definido en features, pero mantenemos any por compatibilidad rápida con Prisma includes
    role?: string;
}

export default function FormCard({ form, role = 'USER' }: FormCardProps) {
    // Determinar estado a mostrar
    const formStatus = form.status as FormStatus;

    // User specific
    const hasResponse = form.hasResponse;
    const evaluation = form.userEvaluation;
    const publicToken = form.publicToken;
    const assignmentStatus = hasResponse ? AssignmentStatus.COMPLETED : AssignmentStatus.PENDING;

    // Admin ve estado del Form (Draft/Published)
    // User ve estado de Asignación (Pending/Completed)
    const displayStatus_Key = role === 'ADMIN' ? formStatus : assignmentStatus;
    const displayLabel = STATUS_LABELS[displayStatus_Key] || displayStatus_Key;
    const badgeVariant = STATUS_COLORS[displayStatus_Key] || "default";

    // Mapeo de variantes de badge de constants a variantes de shadcn/ui si difieren, 
    // pero STATUS_COLORS usa: "default" | "secondary" | "destructive" | "outline" | "success"
    // "success" no suele estar en badge predeterminado, usaremos mapping manual si es necesario.
    // Asumiremos que tenemos una clase o variante para success, si no, usaremos 'default' con clase bg-green.

    const getBadgeClassName = (variant: string) => {
        if (variant === 'success') return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
        if (variant === 'warning') return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
        return ""; // Dejar que el variante se encargue
    }

    // Ajuste de variante para el componente Badge que solo acepta ciertos string literales
    const shadcnVariant = (badgeVariant === 'success' ? 'outline' : badgeVariant) as "default" | "secondary" | "destructive" | "outline";

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge
                        variant={shadcnVariant}
                        className={getBadgeClassName(badgeVariant)}
                    >
                        {displayLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <CardTitle className="line-clamp-1 mt-2">{form.title}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                    {form.description || "Sin descripción"}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-2">
                {role === 'ADMIN' ? (
                    <div className="text-sm text-slate-500">
                        {form._count?.responses || 0} respuestas recibidas
                    </div>
                ) : (
                    <div className="mt-2">
                        {assignmentStatus === AssignmentStatus.COMPLETED && evaluation ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    {evaluation.passed ? (
                                        <Badge className="bg-green-500 hover:bg-green-600">APROBADO</Badge>
                                    ) : (
                                        <Badge variant="destructive">REPROBADO</Badge>
                                    )}
                                    <span className="font-bold text-sm">
                                        Score: {evaluation.totalScore}/{evaluation.maxScore}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Evaluado el {new Date(evaluation.evaluatedAt).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Debes completar esta evaluación</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="grid grid-cols-1 border-t pt-4 bg-slate-50/50">
                {role === 'ADMIN' ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                        <Link href={`/forms/${form.id}/edit`} className="w-full">
                            <Button variant="ghost" size="sm" className="w-full">
                                <Edit className="h-4 w-4 mr-2" /> Editar
                            </Button>
                        </Link>
                        <Link href={`/forms/${form.id}/results`} className="w-full">
                            <Button variant="ghost" size="sm" className="w-full">
                                <BarChart2 className="h-4 w-4 mr-2" /> Resultados
                            </Button>
                        </Link>
                        {formStatus === FormStatus.PUBLISHED && (
                            <div className="flex gap-2">
                                <Link href={`/f/${form.publicToken || ''}`} target="_blank" className="w-full">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        <Eye className="h-4 w-4 mr-2" /> Ver
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full px-2"
                                    onClick={() => {
                                        const url = `${window.location.origin}/f/${form.publicToken || ''}`;
                                        navigator.clipboard.writeText(url);
                                        alert("Link copiado: " + url);
                                    }}
                                >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        {assignmentStatus === AssignmentStatus.PENDING ? (
                            <Link href={publicToken ? `/f/${publicToken}` : '#'} className={!publicToken ? 'pointer-events-none' : ''}>
                                <Button className="w-full" disabled={!publicToken}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    {publicToken ? "Iniciar Evaluación" : "No disponible"}
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" className="w-full" disabled>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Completado
                            </Button>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}