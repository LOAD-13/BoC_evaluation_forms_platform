"use client"
import React from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ScaleQuestion from "@/components/forms/ScaleQuestion"
import { cn } from "@/lib/utils"

interface QuestionRendererProps {
    question: any;
    value: any;
    onChange: (val: any) => void;
    error?: string;
}

export default function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {

    // Función auxiliar para manejar checkbox (array de IDs)
    const handleCheckboxChange = (optionId: string, checked: boolean) => {
        const currentValues = Array.isArray(value) ? value : [];
        if (checked) {
            onChange([...currentValues, optionId]);
        } else {
            onChange(currentValues.filter((v: string) => v !== optionId));
        }
    };

    return (
        <Card className={`border-l-4 shadow-sm ${error ? "border-l-red-500 border-red-200" : "border-l-blue-600"}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex justify-between items-start">
                    <span className="leading-snug">{question.questionText}</span>
                    {question.required && <span className="text-red-500 text-sm ml-2 font-normal">*Obligatorio</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>

                {/* --- TIPO: TEXTO --- */}
                {question.questionType === "text" && (
                    <Input
                        placeholder="Escribe tu respuesta aquí..."
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                )}

                {/* --- TIPO: OPCIÓN MÚLTIPLE (Radio) --- */}
                {question.questionType === "multiple" && (
                    <RadioGroup
                        value={value as string}
                        onValueChange={onChange}
                        className="space-y-3"
                    >
                        {question.options.map((opt: any) => (
                            <div key={opt.id} className="relative">
                                <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                                <Label
                                    htmlFor={opt.id}
                                    className="flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-blue-500"
                                >
                                    <div className="h-4 w-4 rounded-full border border-primary ring-offset-background flex items-center justify-center shrink-0">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform" />
                                        {/* Simulación visual del radio button */}
                                        {value === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                    <span className="font-normal text-base">{opt.optionText}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

                {/* --- TIPO: CHECKBOX (Selección Múltiple) --- */}
                {question.questionType === "checkbox" && (
                    <div className="space-y-3">
                        {question.options.map((opt: any) => {
                            const isChecked = Array.isArray(value) && value.includes(opt.id);
                            return (
                                <div
                                    key={opt.id}
                                    className={cn(
                                        "flex items-center space-x-3 border p-3 rounded-lg transition-all cursor-pointer hover:bg-slate-50",
                                        isChecked ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "border-slate-200"
                                    )}
                                    onClick={() => handleCheckboxChange(opt.id, !isChecked)}
                                >
                                    <Checkbox
                                        id={opt.id}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => handleCheckboxChange(opt.id, checked as boolean)}
                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <Label htmlFor={opt.id} className="flex-1 cursor-pointer font-normal text-base">
                                        {opt.optionText}
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* --- TIPO: VERDADERO / FALSO (Tarjetas Grandes) --- */}
                {question.questionType === "true_false" && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        {question.options.map((opt: any) => {
                            const isSelected = value === opt.id;
                            return (
                                <div
                                    key={opt.id}
                                    onClick={() => onChange(opt.id)}
                                    className={cn(
                                        "flex-1 p-6 border-2 rounded-xl cursor-pointer text-center transition-all shadow-sm hover:shadow-md",
                                        isSelected
                                            ? "bg-blue-50 border-blue-600 text-blue-800 font-bold transform scale-[1.02]"
                                            : "bg-white border-slate-200 hover:border-blue-300 text-slate-600"
                                    )}
                                >
                                    <span className="text-lg">{opt.optionText}</span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* --- TIPO: ESCALA --- */}
                {question.questionType === "scale" && (
                    <div className="mt-4 px-2">
                        <ScaleQuestion
                            value={value as number}
                            onChange={onChange}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                            <span>Totalmente en desacuerdo</span>
                            <span>Totalmente de acuerdo</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-red-600 text-sm flex items-center animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}