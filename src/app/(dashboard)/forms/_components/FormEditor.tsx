"use client"
import React, { useState } from "react"
import QuestionBuilder, { Question } from "./QuestionBuilder"
import AssignmentManager from "./AssignmentManager"
import { Button } from "@/components/ui/button"
import { Save, Loader2, RefreshCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormStatus, STATUS_LABELS } from "@/lib/constants/statusTypes"
import { Badge } from "@/components/ui/badge"

interface FormEditorProps {
    formId: string
    initialStatus: string // O FormStatus
    initialTitle: string
}

export default function FormEditor({ formId, initialStatus, initialTitle }: FormEditorProps) {
    const { toast } = useToast()
    const router = useRouter()

    const [status, setStatus] = useState<FormStatus>(initialStatus as FormStatus)
    const [isLoading, setIsLoading] = useState(false)
    const [isSavingStatus, setIsSavingStatus] = useState(false)

    const [questions, setQuestions] = useState<Question[]>([
        { id: Date.now(), text: "", type: "text", required: false, options: [] }
    ])

    const handleStatusChange = async (newStatus: FormStatus) => {
        setIsSavingStatus(true)
        try {
            const response = await fetch(`/api/forms/${formId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error("Error al actualizar estado")

            setStatus(newStatus)
            toast({
                title: "Estado actualizado",
                description: `El formulario ahora está: ${STATUS_LABELS[newStatus]}`,
            })
            router.refresh()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cambiar el estado",
            })
        } finally {
            setIsSavingStatus(false)
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/forms/${formId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questions)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Error al guardar preguntas")
            }

            toast({
                title: "Cambios guardados",
                description: "Las preguntas se han actualizado correctamente.",
            })

            // Opcional: Redirigir o actualizar estado
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight">{initialTitle}</h1>
                        <Badge variant={status === FormStatus.PUBLISHED ? "outline" : "secondary"}>
                            {STATUS_LABELS[status]}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">Gestiona las preguntas y el estado de tu evaluación.</p>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                    {/* Selector de Estado */}
                    <div className="w-[180px]">
                        <Select
                            value={status}
                            onValueChange={(val) => handleStatusChange(val as FormStatus)}
                            disabled={isSavingStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FormStatus.DRAFT}>
                                    {STATUS_LABELS[FormStatus.DRAFT]}
                                </SelectItem>
                                <SelectItem value={FormStatus.PUBLISHED}>
                                    {STATUS_LABELS[FormStatus.PUBLISHED]}
                                </SelectItem>
                                <SelectItem value={FormStatus.ARCHIVED}>
                                    {STATUS_LABELS[FormStatus.ARCHIVED]}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <AssignmentManager formId={formId} />

                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Guardar
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
        </div>
    )
}
