"use client"
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch" // Asegúrate de tener switch.tsx también
import { Button } from "@/components/ui/button"
import { Trash2, PlusCircle } from "lucide-react"

export default function QuestionBuilder() {
    const [questions, setQuestions] = useState([{ id: 1, text: "", type: "text", required: false }])

    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now(), text: "", type: "text", required: false }])
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
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Texto de la pregunta</Label>
                                <Input placeholder="¿Qué deseas preguntar?" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Respuesta</Label>
                                <Select defaultValue={q.type}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Texto Corto</SelectItem>
                                        <SelectItem value="multiple">Opción Múltiple</SelectItem>
                                        <SelectItem value="true_false">Verdadero / Falso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id={`req-${q.id}`} checked={q.required} />
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