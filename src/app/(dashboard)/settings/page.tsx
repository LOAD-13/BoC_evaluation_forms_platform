"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth"; // Tu hook existente
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { user, isLoading } = useAuth(); // Asumiendo que tu hook devuelve esto
    const { toast } = useToast();

    // Estados para Perfil
    const [fullName, setFullName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Estados para Password
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [isSavingPass, setIsSavingPass] = useState(false);

    // Cargar nombre inicial cuando llegue el usuario
    useEffect(() => {
        if (user) setFullName(user.fullName || "");
    }, [user]);

    // --- HANDLERS ---

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName }),
            });

            if (!res.ok) throw new Error("Error al actualizar");

            toast({ title: "Perfil actualizado", description: "Tu nombre ha sido cambiado." });
            // Aquí podrías recargar la página o actualizar el contexto si fuera necesario
        } catch (error) {
            toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast({ title: "Error", description: "Las contraseñas nuevas no coinciden", variant: "destructive" });
            return;
        }

        setIsSavingPass(true);
        try {
            const res = await fetch("/api/auth/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");

            toast({ title: "Éxito", description: "Contraseña actualizada correctamente." });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSavingPass(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuenta</h1>
                <p className="text-muted-foreground">Gestiona tu información personal y seguridad.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="profile">
                        <User className="mr-2 h-4 w-4" /> Perfil
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="mr-2 h-4 w-4" /> Seguridad
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB PERFIL --- */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Actualiza cómo te ven otros usuarios en la plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input value={user?.email} disabled className="bg-gray-100 cursor-not-allowed" />
                                <p className="text-xs text-muted-foreground">El correo no se puede cambiar.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleUpdateProfile} disabled={isSavingProfile}>
                                    {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB SEGURIDAD --- */}
                <TabsContent value="security" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contraseña</CardTitle>
                            <CardDescription>Cambia tu contraseña regularmente para mantener tu cuenta segura.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Contraseña Actual</Label>
                                <Input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nueva Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirmar Nueva Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleUpdatePassword} disabled={isSavingPass} variant="default">
                                    {isSavingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar Contraseña
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}