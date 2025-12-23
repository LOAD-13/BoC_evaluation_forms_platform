"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(1, "Ingresa tu contraseña"),
});

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            // Limpiamos historial
            window.history.replaceState({}, '', window.location.pathname);

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Credenciales incorrectas");
            }

            toast({ title: "Bienvenido", description: "Iniciando sesión..." });

            // Leemos si hay una URL de retorno pendiente
            const params = new URLSearchParams(window.location.search);
            const callbackUrl = params.get("callbackUrl");

            if (callbackUrl) {
                router.push(callbackUrl); // Volver al formulario
            } else {
                // Si no, ir al dashboard normal
                const targetPath = data.user.role === 'ADMIN' ? '/dashboard' : '/forms';
                router.push(targetPath);
            }

            router.refresh();

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error de acceso",
                description: error.message || "Correo o contraseña incorrectos.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Iniciar Sesión</CardTitle>
                    <CardDescription>Ingresa a la plataforma de evaluaciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            method="POST"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="nombre@empresa.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* BLOQUE DE CONTRASEÑA ÚNICO (CON ENLACE DE RECUPERACIÓN) */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Contraseña</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs text-primary hover:underline font-medium"
                                                tabIndex={-1}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    "Ingresar"
                                )}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                            Regístrate aquí
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}