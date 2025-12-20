"use client"; // Los componentes de error deben ser del cliente

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Aquí podrías enviar el error a un servicio de reporte
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <h2 className="text-2xl font-bold text-destructive">¡Algo salió mal!</h2>
            <p className="mb-4 text-muted-foreground">
                Ha ocurrido un error inesperado al procesar tu solicitud.
            </p>
            <button
                onClick={() => reset()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                Intentar de nuevo
            </button>
        </div>
    );
}