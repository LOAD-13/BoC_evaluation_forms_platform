"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ScaleQuestion from "@/components/forms/ScaleQuestion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Option {
    id: string;
    optionText: string;
    isCorrect?: boolean; // <--- Agregado para poder calcular la nota
}

interface Question {
    id: string;
    questionText: string;
    questionType: string;
    required: boolean;
    score?: number | null; // <--- Agregado para saber cuánto vale
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
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [scoreResult, setScoreResult] = useState<{ score: number; passed: boolean } | null>(null);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    // Función auxiliar para calcular nota localmente (Solo para Preview)
    const calculatePreviewScore = () => {
        let totalScore = 0;
        let maxScore = 0;

        form.questions.forEach(q => {
            const questionPoints = Number(q.score) || 0;
            maxScore += questionPoints;

            const userAnswerId = answers[q.id];

            // Lógica para Opción Múltiple / Verdadero-Falso
            if (q.questionType === 'multiple' || q.questionType === 'true_false') {
                const selectedOption = q.options.find(opt => opt.id === userAnswerId);
                if (selectedOption?.isCorrect) {
                    totalScore += questionPoints;
                }
            }
            // Aquí puedes agregar lógica para otros tipos si es necesario
        });

        // Consideramos aprobado si saca más del 60% (puedes ajustar esto)
        const passed = totalScore >= (maxScore * 0.6);
        return { score: totalScore, passed };
    };

    const handleSubmit = async () => {
        const missingRequired = form.questions.filter(q => q.required && !answers[q.id]);
        if (missingRequired.length > 0) {
            toast({
                title: "Faltan preguntas",
                description: "Responde las obligatorias marcadas con *",
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

            // Simulamos un pequeño retraso y calculamos
            setTimeout(() => {
                const result = calculatePreviewScore(); // <--- AQUI USAMOS LA NUEVA FUNCIÓN
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
            toast({ title: "Enviado", description: "Respuestas guardadas." });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo enviar.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFinished && scoreResult) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados {previewMode ? "(Simulación)" : ""}</CardTitle>
                        <CardDescription>{form.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <span className="text-6xl font-bold text-primary">{scoreResult.score}</span>
                            <span className="text-xl text-muted-foreground">Puntos Obtenidos</span>
                        </div>
                        <div className={`p-4 rounded-lg font-bold text-xl ${scoreResult.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {scoreResult.passed ? "¡APROBADO!" : "REPROBADO"}
                        </div>
                        <Button onClick={() => previewMode ? window.location.reload() : router.refresh()} variant="outline">
                            {previewMode ? "Probar de nuevo" : "Volver"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {form.bannerImageUrl && (
                <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-sm">
                    <Image src={form.bannerImageUrl} alt="Form Banner" fill className="object-cover" priority />
                </div>
            )}

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{form.title}</h1>
                {form.description && <p className="text-muted-foreground">{form.description}</p>}
            </div>

            <div className="space-y-6">
                {form.questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-medium">
                                    {index + 1}. {q.questionText}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                </CardTitle>
                                {previewMode && q.score ? (
                                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">
                                        {Number(q.score)} pts
                                    </span>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {q.questionType === "text" && (
                                <Input
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Tu respuesta..."
                                />
                            )}
                            {(q.questionType === "multiple" || q.questionType === "true_false") && (
                                <RadioGroup
                                    value={answers[q.id] || ""}
                                    onValueChange={(val) => handleAnswerChange(q.id, val)}
                                >
                                    <div className="space-y-2">
                                        {q.options.map((opt) => (
                                            <div key={opt.id} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt.id} id={opt.id} />
                                                <Label htmlFor={opt.id} className="cursor-pointer font-normal">
                                                    {opt.optionText}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            )}
                            {(q.questionType === "scale" || q.questionType === "SCALE") && (
                                <div className="pt-2">
                                    <ScaleQuestion
                                        value={answers[q.id] ? parseInt(answers[q.id]) : undefined}
                                        onChange={(val) => handleAnswerChange(q.id, val.toString())}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pb-10">
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    // [AQUÍ CAMBIAS EL COLOR DEL BOTÓN]
                    // bg-blue-600 es azul. Puedes usar: bg-green-600, bg-purple-600, bg-black, etc.
                    className={previewMode ? "bg-black hover:bg-gray-700 text-white" : ""}
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                    {previewMode ? "Simular Envío" : "Finalizar Examen"}
                </Button>
            </div>
        </div>
    );
}