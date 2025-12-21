"use client"
import React, { useState } from "react"
import QuestionBuilder, { Question } from "./QuestionBuilder"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FormEditorProps {
    formId: string
    // initialQuestions could be added here later
}

export default function FormEditor({ formId }: FormEditorProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [questions, setQuestions] = useState<Question[]>([
        { id: Date.now(), text: "", type: "text", required: false, options: [] }
    ])

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
            <div className="flex justify-between items-center">
                {/* Aquí podríamos poner info del formulario */}
                <div />
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                        </>
                    )}
                </Button>
            </div>

            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
        </div>
    )
}
