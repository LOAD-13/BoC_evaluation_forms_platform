"use client" // Indispensable porque QuestionBuilder usa hooks

import QuestionBuilder from "../../_components/QuestionBuilder"
import { useParams } from "next/navigation"

export default function EditFormPage() {
    const params = useParams()
    const formId = params.formId as string

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Editor de Formulario</h1>
            <p className="text-muted-foreground mb-4">Editando formulario ID: {formId}</p>

            <QuestionBuilder />
        </div>
    )
}
