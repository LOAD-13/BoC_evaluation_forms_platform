import React from "react";
// Asegúrate de que estos componentes existan. Si no, coméntalos temporalmente.
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {/* Sidebar fijo a la izquierda (oculto en móvil) */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Contenido principal */}
            <main className="md:pl-72 h-full">
                <Header />
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}