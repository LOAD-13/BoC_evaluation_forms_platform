"use client"
import React, { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, PlusCircle, X, CheckCircle2, BarChartHorizontal, CheckSquare } from "lucide-react"
import { QUESTION_TYPES } from "@/lib/constants/questionTypes"
import ScaleQuestion from "@/components/forms/ScaleQuestion"

export interface QuestionOption {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string | number;
    text: string;
    type: "text" | "multiple" | "checkbox" | "true_false" | "scale";
    required: boolean;
    points: number;
    options?: QuestionOption[];
}

interface QuestionBuilderProps {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
}

export default function QuestionBuilder({ questions, setQuestions }: QuestionBuilderProps) {

    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now(), text: "", type: "text", required: true, points: 1, options: [] }])
    }

    const updateQuestion = (id: string | number, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                // Lógica especial al cambiar de tipo
                if (field === 'type') {
                    // Si cambia a Verdadero/Falso, reiniciamos las opciones automáticamente
                    if (value === 'true_false') {
                        return {
                            ...q,
                            [field]: value,
                            options: [
                                { text: "Verdadero", isCorrect: true },
                                { text: "Falso", isCorrect: false }
                            ]
                        };
                    }
                    // Si cambia a Checkbox o Múltiple y no tiene opciones, inicializamos una vacía
                    if ((value === 'multiple' || value === 'checkbox') && (!q.options || q.options.length === 0)) {
                        return { ...q, [field]: value, options: [{ text: "", isCorrect: false }] };
                    }
                }
                return { ...q, [field]: value };
            }
            return q;
        }));
    }

    const addOption = (qId: string | number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const currentOptions = q.options || [];
                return { ...q, options: [...currentOptions, { text: "", isCorrect: false }] }
            }
            return q;
        }));
    }

    const updateOptionText = (qId: string | number, optIndex: number, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                const newOptions = [...q.options];
                newOptions[optIndex] = { ...newOptions[optIndex], text };
                return { ...q, options: newOptions }
            }
            return q;
        }));
    }

    const toggleOptionCorrectness = (qId: string | number, optIndex: number, isSingleChoice: boolean) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                let newOptions = [...q.options];

                if (isSingleChoice) {
                    // Si es selección única (Radio o True/False), desmarcar todas las demás
                    newOptions = newOptions.map((o, i) => ({
                        ...o,
                        isCorrect: i === optIndex // Solo la clickeada es true
                    }));
                } else {
                    // Si es selección múltiple (Checkbox), solo alternar la actual
                    newOptions[optIndex] = { ...newOptions[optIndex], isCorrect: !newOptions[optIndex].isCorrect };
                }

                return { ...q, options: newOptions }
            }
            return q;
        }));
    }

    const removeOption = (qId: string | number, optIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                return { ...q, options: q.options.filter((_, i) => i !== optIndex) }
            }
            return q;
        }));
    }

    return (
        <div className="space-y-6">
            {questions.map((q, index) => (
                <Card key={q.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Pregunta {index + 1}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setQuestions(questions.filter(i => i.id !== q.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-12">
                            <div className="space-y-2 md:col-span-8">
                                <Label>Texto de la pregunta</Label>
                                <Input
                                    placeholder="¿Qué deseas preguntar?"
                                    value={q.text || ""}
                                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={q.type}
                                    onValueChange={(val) => updateQuestion(q.id, 'type', val)}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {QUESTION_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Puntos</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={q.points ?? 0}
                                    onChange={(e) => updateQuestion(q.id, 'points', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* ================= SECCIÓN DE OPCIONES ================= */}

                        {/* 1. OPCIÓN MÚLTIPLE (Radio) y CHECKBOX (Multiple) */}
                        {(q.type === 'multiple' || q.type === 'checkbox') && (
                            <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                                <Label>
                                    {q.type === 'checkbox' ? 'Opciones (Selección Múltiple)' : 'Opciones (Selección Única)'}
                                </Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Haz clic en el {q.type === 'checkbox' ? 'cuadrado' : 'círculo'} para marcar la(s) respuesta(s) correcta(s).
                                </p>
                                <div className="space-y-2">
                                    {q.options?.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-2">
                                            {/* Botón para marcar correcta */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 rounded-full ${opt.isCorrect ? 'text-green-600 bg-green-100' : 'text-gray-300'}`}
                                                onClick={() => toggleOptionCorrectness(q.id, optIndex, q.type === 'multiple')}
                                            >
                                                {q.type === 'checkbox' ? (
                                                    <CheckSquare className="h-5 w-5" />
                                                ) : (
                                                    <CheckCircle2 className="h-5 w-5" />
                                                )}
                                            </Button>

                                            <Input
                                                className="h-8"
                                                placeholder={`Opción ${optIndex + 1}`}
                                                value={opt.text || ""}
                                                onChange={(e) => updateOptionText(q.id, optIndex, e.target.value)}
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(q.id, optIndex)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="mt-2">
                                        <PlusCircle className="mr-2 h-3 w-3" /> Agregar opción
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 2. VERDADERO / FALSO (Ahora sí se ve) */}
                        {q.type === 'true_false' && (
                            <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                                <Label>Definir respuesta correcta</Label>
                                <div className="flex gap-4 mt-2">
                                    {q.options?.map((opt, index) => (
                                        <div
                                            key={index}
                                            onClick={() => toggleOptionCorrectness(q.id, index, true)} // True/False es selección única
                                            className={`
                                                flex-1 p-4 border rounded-lg cursor-pointer text-center transition-all
                                                ${opt.isCorrect
                                                    ? 'bg-green-50 border-green-500 ring-1 ring-green-500'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'}
                                            `}
                                        >
                                            <span className={`font-semibold ${opt.isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                                                {opt.text}
                                            </span>
                                            {opt.isCorrect && <p className="text-xs text-green-600 mt-1">(Correcta)</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. SCALE (1-5) */}
                        {q.type === 'scale' && (
                            <div className="bg-muted/30 p-4 rounded-md border border-dashed">
                                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                                    <BarChartHorizontal className="h-4 w-4" />
                                    <span className="text-sm font-medium">Vista Previa (Escala 1 al 5)</span>
                                </div>
                                <div className="pointer-events-none opacity-80">
                                    <ScaleQuestion disabled />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id={`req-${q.id}`}
                                checked={q.required}
                                onCheckedChange={(val) => updateQuestion(q.id, 'required', val)}
                            />
                            <Label htmlFor={`req-${q.id}`}>Obligatorio</Label>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button onClick={addQuestion} className="w-full" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Nueva Pregunta
            </Button>
        </div>
    )
}