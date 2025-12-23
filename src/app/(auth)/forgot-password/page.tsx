"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const forgotSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
});

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof forgotSchema>>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: "" },
    });

    async function onSubmit(values: z.infer<typeof forgotSchema>) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al enviar");

            // Mostrar el token solo para pruebas (en producción esto se quita)
            if (data.debugToken) {
                console.log("Token de recuperación:", data.debugToken);
                toast({
                    title: "Modo Desarrollo",
                    description: `Token: ${data.debugToken}`,
                    duration: 10000
                });
            }

            setIsSubmitted(true);
            toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada." });

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "No se pudo procesar la solicitud.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle>Revisa tu correo</CardTitle>
                        <CardDescription>
                            Hemos enviado un enlace de recuperación a <strong>{form.getValues("email")}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Si no lo ves, revisa tu carpeta de spam. (Nota: En modo dev, mira la consola del servidor).
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Volver al inicio de sesión</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Recuperar Contraseña</CardTitle>
                    <CardDescription>Ingresa tu correo para recibir las instrucciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar enlace"}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        <Link href="/login" className="flex items-center justify-center text-primary hover:underline gap-1">
                            <ArrowLeft className="h-4 w-4" /> Volver al login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}