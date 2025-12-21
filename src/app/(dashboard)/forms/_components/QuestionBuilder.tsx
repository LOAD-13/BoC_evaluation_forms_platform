"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, PlusCircle, X, CheckCircle2 } from "lucide-react"

export interface QuestionOption {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string | number;
    text: string;
    type: "text" | "multiple" | "true_false";
    required: boolean;
    points: number; // Mapped to 'score' in DB
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
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
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

    const toggleOptionCorrectness = (qId: string | number, optIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId && q.options) {
                const newOptions = [...q.options];
                // Para simplificar, permitimos múltiples correctas o una sola. 
                // Aquí invertimos el valor actual.
                newOptions[optIndex] = { ...newOptions[optIndex], isCorrect: !newOptions[optIndex].isCorrect };
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
                                    value={q.text}
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
                                        <SelectItem value="text">Texto Corto</SelectItem>
                                        <SelectItem value="multiple">Opción Múltiple</SelectItem>
                                        <SelectItem value="true_false">V / F</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Puntos (Score)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={q.points}
                                    onChange={(e) => updateQuestion(q.id, 'points', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Opciones para Multiple Choice */}
                        {q.type === 'multiple' && (
                            <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                                <Label>Opciones de respuesta</Label>
                                <p className="text-xs text-muted-foreground mb-2">Marca el círculo verde para indicar la respuesta correcta.</p>
                                <div className="space-y-2">
                                    {q.options?.map((opt, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 rounded-full ${opt.isCorrect ? 'text-green-600 bg-green-100' : 'text-gray-300'}`}
                                                onClick={() => toggleOptionCorrectness(q.id, optIndex)}
                                                title="Marcar como correcta"
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                            </Button>
                                            <Input
                                                className="h-8"
                                                placeholder={`Opción ${optIndex + 1}`}
                                                value={opt.text}
                                                onChange={(e) => updateOptionText(q.id, optIndex, e.target.value)}
                                            />
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(q.id, optIndex)}>
                                                <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="mt-2">
                                        <PlusCircle className="mr-2 h-3 w-3" /> Agregar opción
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
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