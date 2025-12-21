import React from "react";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const payload = await verifyJwt(token);
    if (!payload) redirect("/login");

    return (
        <div className="min-h-screen">
            {/* Sidebar fijo a la izquierda (oculto en móvil) */}
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
                <Sidebar userRole={payload.role as string} />
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