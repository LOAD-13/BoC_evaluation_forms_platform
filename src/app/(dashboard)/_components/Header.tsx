"use client"; // Puede que necesites use client si usas hooks, si no, puedes quitarlo
import Link from "next/link";
import Image from "next/image";
import LogoutLink from "@/components/auth/LogoutLink"; // Asegúrate de importar el botón de salir si lo usas aquí

export default function Header() {
    return (
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-20 shadow-sm">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2">


                </Link>
            </div>

            {/* Acciones Derecha */}
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 hidden sm:block">
                    Panel de Administración
                </div>
                <LogoutLink />
            </div>
        </header>
    );
}