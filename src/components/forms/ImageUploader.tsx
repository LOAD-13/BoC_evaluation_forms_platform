"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
    value?: string | null;
    onChange: (url: string) => void;
    folder?: string;
}

export default function ImageUploader({ value, onChange, folder = "banners" }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        // Nota: Aunque el componente recibe 'folder', la ruta de API actual está fija en /api/upload/banner
        // Si quieres hacerlo dinámico, deberías pasar el folder en la URL o en el body.
        // Por ahora usaremos la ruta que acabamos de crear.

        try {
            const res = await fetch("/api/upload/banner", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Error al subir imagen");
            }

            const data = await res.json();
            onChange(data.url);
            toast({ title: "Imagen subida correctamente" });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo subir la imagen" });
        } finally {
            setIsUploading(false);
            // Limpiar el input para permitir subir el mismo archivo si se borra y se vuelve a poner
            e.target.value = "";
        }
    };

    if (value) {
        return (
            <div className="relative w-full h-48 rounded-md overflow-hidden border bg-gray-50">
                <Image
                    src={value}
                    alt="Banner"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 z-10"
                    onClick={() => onChange("")}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        // AQUÍ ESTÁ EL CAMBIO CLAVE: agregada la clase "relative"
        <div className="relative w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors group">

            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
                <span className="text-sm font-medium">
                    {isUploading ? "Subiendo..." : "Click para subir banner"}
                </span>
            </div>

            <input
                type="file"
                accept="image/*"
                // "absolute inset-0" ahora se limitará a este div gracias al "relative" del padre
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isUploading}
                onChange={handleUpload}
            />
        </div>
    );
}