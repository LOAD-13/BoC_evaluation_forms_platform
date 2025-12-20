"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/forms", label: "Formularios", icon: FileText },
    { href: "/users", label: "Usuarios", icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card text-card-foreground shadow-sm hidden md:flex flex-col">
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold tracking-tight text-primary">EvalPlatform</h1>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-2 ${isActive ? "bg-secondary" : ""}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <Link href="/login">
                    <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </Link>
            </div>
        </aside>
    );
}