"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
    userRole?: string;
}

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-slate-400", // Gris claro para fondo oscuro
        adminOnly: true,
    },
    {
        label: "Mis Formularios",
        icon: FileText,
        href: "/forms",
        color: "text-slate-400",
    },
    {
        label: "Usuarios",
        icon: Users,
        href: "/users",
        color: "text-slate-400",
        adminOnly: true,
    },
    {
        label: "Configuración",
        icon: Settings,
        href: "/settings",
        color: "text-slate-400",
    },
];

export default function Sidebar({ userRole = 'USER' }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            toast({ title: "Sesión cerrada correctamente" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            toast({ title: "Error al cerrar sesión", variant: "destructive" });
        }
    };

    return (
        // [CAMBIO] Fondo oscuro (bg-slate-900) y texto claro
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100">

            {/* --- ZONA DEL LOGO --- */}
            <div className="px-6 py-4 flex items-center justify-center lg:justify-start">
                <Link href="/dashboard" className="flex items-center gap-2">
                    {/* Contenedor blanco suave para que el logo resalte si es oscuro */}
                    <div className="relative h-20 w-56 bg-white/90 rounded px-4 py-1">
                        <Image
                            src="/assets/bank-of-china.svg"
                            alt="BoC Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                </Link>
            </div>

            {/* --- NAVEGACIÓN --- */}
            <div className="px-3 py-2 flex-1">
                <div className="space-y-1">
                    {routes.map((route) => {
                        if (route.adminOnly && userRole !== 'ADMIN') return null;

                        const isActive = pathname === route.href || pathname.startsWith(route.href + "/");

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/20 text-white font-semibold" // Activo: Fondo rojo semitransparente
                                        : "text-slate-400 hover:text-white hover:bg-white/10" // Inactivo: Hover efecto luz
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon
                                        className={cn(
                                            "h-5 w-5 mr-3 transition-colors",
                                            isActive ? "text-red-500" : "text-slate-400 group-hover:text-white"
                                        )}
                                    />
                                    {route.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* --- FOOTER / LOGOUT --- */}
            <div className="px-3 py-4 border-t border-slate-800">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}