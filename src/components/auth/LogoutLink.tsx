"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutLink() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // 1. Llamar a la API para borrar la cookie
            await fetch("/api/auth/logout", { method: "POST" });

            // 2. Capturar la URL actual del formulario
            const currentUrl = window.location.href;

            // 3. Redirigir al login enviando la URL de retorno
            // Usamos window.location.href para forzar una recarga limpia
            window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;

        } catch (error) {
            console.error("Error al salir", error);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 text-xs text-gray-500 hover:text-red-600"
        >
            <LogOut className="mr-2 h-4 w-4" />
            Cambiar cuenta
        </Button>
    );
}