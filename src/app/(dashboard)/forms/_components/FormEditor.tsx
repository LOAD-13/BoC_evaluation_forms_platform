"use client"
import React, { useState } from "react"
import Link from "next/link"
import QuestionBuilder, { Question } from "./QuestionBuilder"
import AssignmentManager from "./AssignmentManager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import ImageUploader from "@/components/forms/ImageUploader"
import { Save, Loader2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch" // <--- 1. Importar Switch
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
    initialStatus: string
    initialTitle: string
    initialDescription?: string
    initialBannerUrl?: string | null
    initialQuestions?: Question[]
    initialAllowMultiple?: boolean // <--- 2. Nueva prop
}

export default function FormEditor({
    formId,
    initialStatus,
    initialTitle,
    initialDescription,
    initialBannerUrl,
    initialQuestions,
    initialAllowMultiple
}: FormEditorProps) {
    const { toast } = useToast()
    const router = useRouter()

    const [status, setStatus] = useState<FormStatus>(initialStatus as FormStatus)
    const [isLoading, setIsLoading] = useState(false)

    // Estados para metadatos del formulario
    const [title, setTitle] = useState(initialTitle)
    const [description, setDescription] = useState(initialDescription || "")
    const [bannerUrl, setBannerUrl] = useState(initialBannerUrl)

    // [NUEVO] Estado para múltiples respuestas
    const [allowMultiple, setAllowMultiple] = useState(initialAllowMultiple || false)

    const [questions, setQuestions] = useState<Question[]>(
        initialQuestions && initialQuestions.length > 0
            ? initialQuestions
            : [{ id: Date.now(), text: "", type: "text", required: false, options: [], points: 1 }]
    )

    // Función unificada para guardar los metadatos
    const handleUpdateMetadata = async (fieldData: any) => {
        try {
            const response = await fetch(`/api/forms/${formId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldData)
            })

            if (!response.ok) throw new Error("Error al actualizar")

            // Actualizar estados locales si la respuesta es exitosa
            if (fieldData.status) setStatus(fieldData.status)
            if (fieldData.allowMultipleResponses !== undefined) setAllowMultiple(fieldData.allowMultipleResponses)

            toast({ title: "Guardado correctamente" })
            router.refresh()
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cambio" })
        }
    }

    const handleSaveQuestions = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/forms/${formId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questions)
            })

            if (!response.ok) throw new Error("Error al guardar preguntas")

            toast({ title: "Preguntas guardadas", description: "El examen está actualizado." })
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* ENCABEZADO DE GESTIÓN */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-4">
                <div className="flex items-center gap-3">
                    <Badge variant={status === FormStatus.PUBLISHED ? "default" : "secondary"} className="text-sm px-3 py-1">
                        {STATUS_LABELS[status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Última edición: Reciente</span>
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={status}
                        onValueChange={(val) => handleUpdateMetadata({ status: val })}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={FormStatus.DRAFT}>{STATUS_LABELS[FormStatus.DRAFT]}</SelectItem>
                            <SelectItem value={FormStatus.PUBLISHED}>{STATUS_LABELS[FormStatus.PUBLISHED]}</SelectItem>
                            <SelectItem value={FormStatus.ARCHIVED}>{STATUS_LABELS[FormStatus.ARCHIVED]}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Link href={`/forms/${formId}/preview`} target="_blank">
                        <Button variant="outline" size="sm" title="Vista Previa">
                            <Eye className="h-4 w-4 mr-2" />
                            Vista Previa
                        </Button>
                    </Link>

                    <AssignmentManager formId={formId} />

                    <Button onClick={handleSaveQuestions} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Preguntas
                    </Button>
                </div>
            </div>

            {/* SECCIÓN DE EDICIÓN DE DETALLES DEL FORMULARIO */}
            <div className="grid gap-6 bg-white p-6 rounded-lg border shadow-sm">

                {/* Banner */}
                <div className="space-y-2">
                    <Label>Imagen de Banner (Opcional)</Label>
                    <ImageUploader
                        value={bannerUrl}
                        onChange={(url) => {
                            setBannerUrl(url);
                            handleUpdateMetadata({ bannerImageUrl: url });
                        }}
                    />
                </div>

                {/* Título y Descripción */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="form-title">Título del Examen / Encuesta</Label>
                        <Input
                            id="form-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => handleUpdateMetadata({ title })}
                            className="font-bold text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="form-desc">Descripción</Label>
                        <Textarea
                            id="form-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => handleUpdateMetadata({ description })}
                            rows={3}
                            className="resize-none"
                            placeholder="Instrucciones para el usuario..."
                        />

                        {/* --- 3. AQUÍ ESTÁ EL SWITCH --- */}
                        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50 mt-4">
                            <Switch
                                id="allow-multiple"
                                checked={allowMultiple}
                                onCheckedChange={(checked) => handleUpdateMetadata({ allowMultipleResponses: checked })}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="allow-multiple" className="text-sm font-medium leading-none cursor-pointer">
                                    Permitir múltiples intentos
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Si está activo, los usuarios podrán responder el formulario varias veces.
                                </p>
                            </div>
                        </div>
                        {/* ----------------------------- */}

                    </div>
                </div>
            </div>

            {/* CONSTRUCTOR DE PREGUNTAS */}
            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
        </div>
    )
}