"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
// [IMPORTANTE] Importamos el componente bonito
import QuestionRenderer from "./QuestionRenderer";

interface Option {
    id: string;
    optionText: string;
    isCorrect?: boolean;
}

interface Question {
    id: string;
    questionText: string;
    questionType: string;
    required: boolean;
    score?: number | null;
    options: Option[];
}

interface FormRendererProps {
    form: {
        id: string;
        title: string;
        description: string | null;
        bannerImageUrl?: string | null;
        questions: Question[];
    };
    responseId?: string;
    previewMode?: boolean;
}

export default function FormRenderer({ form, responseId, previewMode = false }: FormRendererProps) {
    const { toast } = useToast();
    const router = useRouter();
    // [CAMBIO] Usamos 'any' para permitir arrays (checkboxes) y strings
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [scoreResult, setScoreResult] = useState<{ score: number; passed: boolean } | null>(null);

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    // Función auxiliar para calcular nota localmente (Solo para Preview)
    const calculatePreviewScore = () => {
        let totalScore = 0;
        let maxScore = 0;

        form.questions.forEach(q => {
            const questionPoints = Number(q.score) || 0;
            maxScore += questionPoints;

            const userAnswer = answers[q.id];

            // 1. Lógica para Opción Múltiple / Verdadero-Falso
            if (q.questionType === 'multiple' || q.questionType === 'true_false') {
                const selectedOption = q.options.find(opt => opt.id === userAnswer);
                if (selectedOption?.isCorrect) {
                    totalScore += questionPoints;
                }
            }

            // 2. [NUEVO] Lógica para Checkbox (Selección Múltiple)
            if (q.questionType === 'checkbox' && Array.isArray(userAnswer)) {
                // Obtenemos los IDs de todas las opciones correctas
                const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);

                // Verificamos:
                // a) Que la cantidad seleccionada sea igual a la cantidad de correctas
                // b) Que cada opción seleccionada esté en la lista de correctas
                const isCorrect =
                    userAnswer.length === correctOptionIds.length &&
                    userAnswer.every((id: string) => correctOptionIds.includes(id));

                if (isCorrect) {
                    totalScore += questionPoints;
                }
            }
        });

        // Consideramos aprobado si saca más del 60%
        const passed = maxScore > 0 ? totalScore >= (maxScore * 0.6) : true;
        return { score: totalScore, passed };
    };

    const handleSubmit = async () => {
        // Validación de requeridos (soporta arrays vacíos también)
        const missingRequired = form.questions.filter(q => {
            if (!q.required) return false;
            const ans = answers[q.id];
            if (Array.isArray(ans)) return ans.length === 0; // Checkbox vacío
            return !ans; // String vacío o null
        });

        if (missingRequired.length > 0) {
            toast({
                title: "Faltan preguntas",
                description: "Por favor responde las preguntas obligatorias marcadas con *",
                variant: "destructive"
            });
            return;
        }

        if (previewMode) {
            toast({
                title: "Modo Vista Previa",
                description: "Calculando resultado simulado...",
            });
            setIsSubmitting(true);

            setTimeout(() => {
                const result = calculatePreviewScore();
                setScoreResult(result);
                setIsSubmitting(false);
                setIsFinished(true);
            }, 1000);
            return;
        }

        if (!responseId) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/responses/${responseId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
            });

            if (!res.ok) throw new Error("Error al enviar");

            const data = await res.json();
            setScoreResult({ score: data.score, passed: data.passed });
            setIsFinished(true);
            toast({ title: "Enviado", description: "Respuestas guardadas correctamente." });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo enviar las respuestas.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFinished && scoreResult) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <Card className="border-2 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Resultados {previewMode ? "(Simulación)" : ""}</CardTitle>
                        <CardDescription>{form.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <span className="text-7xl font-extrabold text-primary">{scoreResult.score}</span>
                            <span className="text-lg text-muted-foreground uppercase tracking-widest font-semibold">Puntos</span>
                        </div>

                        <div className={`
                            p-6 rounded-xl font-bold text-2xl border-2 transform transition-all
                            ${scoreResult.passed
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"}
                        `}>
                            {scoreResult.passed ? "🎉 ¡APROBADO!" : "❌ REPROBADO"}
                        </div>

                        <Button
                            onClick={() => previewMode ? window.location.reload() : router.refresh()}
                            variant="default"
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            {previewMode ? "Probar de nuevo" : "Volver al inicio"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {form.bannerImageUrl && (
                <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md">
                    <Image src={form.bannerImageUrl} alt="Form Banner" fill className="object-cover" priority />
                </div>
            )}

            <div className="text-center space-y-4 mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">{form.title}</h1>
                {form.description && <p className="text-lg text-slate-600 max-w-2xl mx-auto">{form.description}</p>}
            </div>

            <div className="space-y-6">
                {form.questions.map((q) => (
                    // [AQUÍ ESTÁ LA MAGIA] Usamos el componente bonito
                    <QuestionRenderer
                        key={q.id}
                        question={q}
                        value={answers[q.id]}
                        onChange={(val) => handleAnswerChange(q.id, val)}
                        error={ /* Aquí podrías pasar errores si validaras campo por campo */ undefined}
                    />
                ))}
            </div>

            <div className="flex justify-end pt-6 pb-10">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className={`min-w-[200px] text-lg h-12 shadow-lg transition-all hover:scale-105 ${previewMode ? "bg-slate-800 hover:bg-slate-900" : ""}`}
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                    {previewMode ? "Simular Envío" : "Finalizar y Enviar"}
                </Button>
            </div>
        </div>
    );
}