"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this or use Input
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Option {
    id: string;
    optionText: string;
}

interface Question {
    id: string;
    questionText: string;
    questionType: string;
    required: boolean;
    options: Option[];
}

interface FormRendererProps {
    form: {
        id: string;
        title: string;
        description: string | null;
        questions: Question[];
    };
    responseId: string;
}

export default function FormRenderer({ form, responseId }: FormRendererProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [scoreResult, setScoreResult] = useState<{ score: number; passed: boolean } | null>(null);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        // Validate required questions
        const missingRequired = form.questions.filter(q => q.required && !answers[q.id]);
        if (missingRequired.length > 0) {
            toast({
                title: "Faltan preguntas por responder",
                description: "Por favor responde todas las preguntas obligatorias.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/responses/${responseId}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers }),
            });

            if (!res.ok) throw new Error("Error al enviar el formulario");

            const data = await res.json();
            setScoreResult({ score: data.score, passed: data.passed });
            setIsFinished(true);
            toast({
                title: "Examen finalizado",
                description: "Tus respuestas han sido enviadas correctamente.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Hubo un problema al enviar tus respuestas.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFinished && scoreResult) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Resultados del Examen</CardTitle>
                        <CardDescription>Has completado la evaluación: {form.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <span className="text-6xl font-bold text-primary">{scoreResult.score}</span>
                            <span className="text-xl text-muted-foreground">Puntos Totales</span>
                        </div>

                        <div className={`p-4 rounded-lg font-bold text-xl ${scoreResult.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {scoreResult.passed ? "¡APROBADO!" : "REPROBADO"}
                        </div>

                        <Button onClick={() => router.refresh()} variant="outline">Volver a intentar (si está permitido)</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{form.title}</h1>
                {form.description && <p className="text-muted-foreground">{form.description}</p>}
            </div>

            <div className="space-y-6">
                {form.questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">
                                {index + 1}. {q.questionText}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {q.questionType === "text" && (
                                <Input
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    placeholder="Escribe tu respuesta aquí..."
                                />
                            )}

                            {(q.questionType === "multiple" || q.questionType === "true_false") && (
                                <RadioGroup
                                    value={answers[q.id] || ""}
                                    onValueChange={(val) => handleAnswerChange(q.id, val)}
                                >
                                    <div className="space-y-2">
                                        {/* Para True/False simulamos opciones si no vienen de DB, o usamos las de DB si existen */}
                                        {q.questionType === "true_false" && q.options.length === 0 ? (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="true" id={`${q.id}-true`} />
                                                    <Label htmlFor={`${q.id}-true`}>Verdadero</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="false" id={`${q.id}-false`} />
                                                    <Label htmlFor={`${q.id}-false`}>Falso</Label>
                                                </div>
                                            </>
                                        ) : (
                                            q.options.map((opt) => (
                                                <div key={opt.id} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={opt.id} id={opt.id} />
                                                    <Label htmlFor={opt.id} className="cursor-pointer">{opt.optionText}</Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Enviando..." : "Finalizar Examen"}
                </Button>
            </div>
        </div>
    );
}
