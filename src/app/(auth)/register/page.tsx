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
import { useToast } from "@/hooks/use-toast"; // Asegúrate que esta ruta sea correcta

// 1. CAMBIO AQUÍ: Usamos fullName en el esquema
const registerSchema = z.object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // 2. CAMBIO AQUÍ: defaultValues usa fullName
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: "", email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al registrarse");
            }

            toast({
                title: "¡Cuenta creada!",
                description: "Ahora puedes iniciar sesión.",
            });
            router.push("/login");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Crear una cuenta</CardTitle>
                    <CardDescription>Ingresa tus datos para comenzar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* 3. CAMBIO AQUÍ: name="fullName" */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre completo</FormLabel>
                                        <FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl><Input placeholder="juan@ejemplo.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrarse
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                            Inicia sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}