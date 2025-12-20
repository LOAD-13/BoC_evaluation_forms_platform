"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Settings, Eye, ArrowLeft, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface FormEditorProps {
    initialData: any; // Tipar esto mejor con tus tipos de Prisma si es posible
}

export default function FormEditor({ initialData }: FormEditorProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [formData, setFormData] = useState(initialData);
    const [questions, setQuestions] = useState(initialData.questions || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Guardar cambios del encabezado (título/descripción)
    const handleSaveHeader = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/forms/${formData.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                }),
            });

            if (!res.ok) throw new Error("Error al guardar");
            toast({ title: "Cambios guardados correctamente" });
            router.refresh();
        } catch (error) {
            toast({ variant: "destructive", title: "Error al guardar" });
        } finally {
            setIsSaving(false);
        }
    };

    // FUNCIÓN NUEVA: Eliminar formulario
    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de querer eliminar este formulario? Esta acción no se puede deshacer.")) return;

        try {
            const res = await fetch(`/api/forms/${formData.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");

            toast({ title: "Formulario eliminado" });
            router.push("/forms"); // Volver a la lista
        } catch (error) {
            toast({ variant: "destructive", title: "Error al eliminar formulario" });
        }
    };

    // FUNCIÓN NUEVA: Subir banner
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/upload/banner', {
                method: 'POST',
                body: formDataUpload,
            });

            if (!res.ok) throw new Error('Falló la subida');
            const data = await res.json();

            // Actualizamos el estado local con la nueva URL
            setFormData({ ...formData, bannerImageUrl: data.url });

            // Guardamos la URL en la BD del formulario automáticamente
            await fetch(`/api/forms/${formData.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bannerImageUrl: data.url }),
            });

            toast({ title: "Banner actualizado" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error al subir imagen" });
        } finally {
            setIsUploading(false);
        }
    };

    // Agregar una pregunta nueva (Básica)
    const handleAddQuestion = async (type: string) => {
        try {
            const res = await fetch(`/api/forms/${formData.id}/questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionText: "Nueva Pregunta",
                    questionType: type,
                    score: 0,
                    required: true
                }),
            });

            if (!res.ok) throw new Error("Error al crear pregunta");
            const newQuestion = await res.json();
            setQuestions([...questions, newQuestion]);
            toast({ title: "Pregunta agregada" });
            router.refresh(); // Recarga para ver los datos actualizados
        } catch (error) {
            toast({ variant: "destructive", title: "Error al agregar pregunta" });
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* HEADER */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="container flex items-center gap-4 h-14">
                    <Link href="/forms">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold">{formData.title || "Sin título"}</h1>
                        <Badge variant={formData.status === "draft" ? "secondary" : "default"}>
                            {formData.status}
                        </Badge>
                    </div>

                    <div className="ml-auto flex gap-2">
                        {/* Botón Borrar */}
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={handleSaveHeader} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                        </Button>

                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* CONTENIDO */}
            <div className="flex-1 overflow-y-auto">
                <div className="container max-w-3xl py-8 space-y-6">

                    {/* ÁREA DE BANNER (Nuevo bloque visual) */}
                    <Card className="overflow-hidden">
                        {formData.bannerImageUrl ? (
                            <div className="relative h-48 w-full group">
                                <img
                                    src={formData.bannerImageUrl}
                                    alt="Banner del formulario"
                                    className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" /> Cambiar Imagen
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="h-24 bg-muted/40 flex items-center justify-center border-b cursor-pointer hover:bg-muted/60 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex items-center text-muted-foreground text-sm">
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    {isUploading ? "Subiendo..." : "Clic para agregar imagen de portada"}
                                </div>
                            </div>
                        )}
                        {/* Input oculto para el archivo */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                    </Card>

                    {/* TÍTULO Y DESCRIPCIÓN */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Título del formulario</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Título del formulario"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Descripción</label>
                                <Textarea
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe el propósito de este formulario..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* PREGUNTAS */}
                    <div className="space-y-4">
                        {questions.map((q: any, index: number) => (
                            <Card key={q.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">{q.questionType}</Badge>
                                                <span className="text-sm text-muted-foreground">Pregunta {index + 1}</span>
                                            </div>
                                            <p className="font-medium">{q.questionText}</p>
                                        </div>
                                        <Badge variant="secondary">Puntaje: {q.score} pts</Badge>
                                    </div>

                                    {q.options && q.options.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <p className="text-sm text-muted-foreground">Opciones:</p>
                                            {q.options.map((opt: any) => (
                                                <div key={opt.id} className="flex items-center gap-2 text-sm">
                                                    <div className={`h-2 w-2 rounded-full ${opt.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                    <span>{opt.optionText}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* BOTÓN AGREGAR PREGUNTA */}
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => handleAddQuestion("multiple_choice")}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar pregunta
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
