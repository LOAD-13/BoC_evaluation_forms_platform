import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definimos una interfaz básica para el usuario en el frontend
export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    role?: string; // Opcional, dependiendo de tu modelo
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error verificando sesión:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Función auxiliar para logout (opcional, pero útil tenerla aquí)
    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Error al salir", error);
        }
    };

    return { user, isLoading, logout };
}