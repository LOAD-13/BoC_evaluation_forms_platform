"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, BarChart2, Eye, PlayCircle, CheckCircle, Share2, AlertCircle, Trash2, Copy } from "lucide-react"
import { FormStatus, AssignmentStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/statusTypes"
import { useToast } from "@/hooks/use-toast"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface FormCardProps {
    form: any;
    role?: string;
}

export default function FormCard({ form, role = 'USER' }: FormCardProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isCloning, setIsCloning] = useState(false)

    // Determinar estado a mostrar
    const formStatus = form.status as FormStatus;
    const hasResponse = form.hasResponse;
    const evaluation = form.userEvaluation;
    const publicToken = form.publicToken;
    const assignmentStatus = hasResponse ? AssignmentStatus.COMPLETED : AssignmentStatus.PENDING;

    const displayStatus_Key = role === 'ADMIN' ? formStatus : assignmentStatus;
    const displayLabel = STATUS_LABELS[displayStatus_Key] || displayStatus_Key;
    const badgeVariant = STATUS_COLORS[displayStatus_Key] || "default";

    const getBadgeClassName = (variant: string) => {
        if (variant === 'success') return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
        if (variant === 'warning') return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
        return "";
    }

    const shadcnVariant = (badgeVariant === 'success' ? 'outline' : badgeVariant) as "default" | "secondary" | "destructive" | "outline";

    // --- [NUEVO] FUNCIÓN SEGURA PARA COPIAR EN HTTP Y HTTPS ---
    const copyToClipboard = async (text: string) => {
        // Intenta método moderno
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error('Fallo clipboard API', err);
            }
        }

        // Método antiguo (Fallback para HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            console.error('Fallo execCommand', err);
            document.body.removeChild(textArea);
            return false;
        }
    };
    // ----------------------------------------------------------

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/forms/${form.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");
            toast({ title: "Formulario eliminado", description: "El formulario ha sido borrado exitosamente." });
            router.refresh();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar el formulario.", variant: "destructive" });
        }
    };

    const handleClone = async () => {
        if (isCloning) return;
        setIsCloning(true);
        try {
            const res = await fetch(`/api/forms/${form.id}/clone`, { method: "POST" });
            if (!res.ok) throw new Error("Error al clonar");
            const json = await res.json();
            toast({ title: "Duplicado exitosamente", description: "Redirigiendo al nuevo formulario..." });
            if (json.redirectUrl) {
                router.push(json.redirectUrl);
            } else {
                router.refresh();
            }
        } catch (error) {
            toast({ title: "Error", description: "No se pudo copiar el formulario.", variant: "destructive" });
            setIsCloning(false);
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow group">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge variant={shadcnVariant} className={getBadgeClassName(badgeVariant)}>
                        {displayLabel}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <CardTitle className="line-clamp-1 mt-2" title={form.title}>{form.title}</CardTitle>
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
                    <div className="flex items-center gap-2 w-full">
                        <Link href={`/forms/${form.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                                <Edit className="h-4 w-4 mr-2" /> Editar
                            </Button>
                        </Link>

                        <Link href={`/forms/${form.id}/results`} className="flex-1">
                            <Button variant="ghost" size="sm" className="w-full" title="Ver Resultados">
                                <BarChart2 className="h-4 w-4" />
                            </Button>
                        </Link>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={handleClone}
                            disabled={isCloning}
                            title="Duplicar Formulario"
                        >
                            <Copy className={`h-4 w-4 ${isCloning ? 'animate-spin' : ''}`} />
                        </Button>

                        {formStatus === FormStatus.PUBLISHED && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-2"
                                title="Copiar Link"
                                // [AQUÍ USAMOS LA FUNCIÓN SEGURA]cd
                                onClick={async () => {
                                    const url = `${window.location.origin}/f/${form.publicToken || ''}`;
                                    await copyToClipboard(url); // <-- CAMBIO AQUÍ
                                    toast({ title: "Link copiado al portapapeles" });
                                }}
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Eliminar">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el formulario
                                        <strong> "{form.title}"</strong> y todas las respuestas asociadas.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                        Sí, eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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