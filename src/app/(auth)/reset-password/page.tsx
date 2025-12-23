"use client";

import { useState, Suspense } from "react"; // Suspense necesario para useSearchParams
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const resetSchema = z.object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    if (!token) {
        return (
            <div className="text-center text-red-600">
                <p>Token inválido o faltante.</p>
                <Link href="/login" className="underline mt-2 block">Ir al Login</Link>
            </div>
        );
    }

    async function onSubmit(values: z.infer<typeof resetSchema>) {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: values.password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al restablecer");

            setIsSuccess(true);
            toast({ title: "Contraseña actualizada", description: "Ya puedes iniciar sesión." });

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "El enlace ha expirado o es inválido.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">¡Contraseña restablecida!</h3>
                    <p className="text-sm text-gray-500">Tu contraseña ha sido actualizada correctamente.</p>
                </div>
                <Button asChild className="w-full">
                    <Link href="/login">Iniciar Sesión</Link>
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nueva Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cambiar Contraseña"}
                </Button>
            </form>
        </Form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Restablecer Contraseña</CardTitle>
                    <CardDescription>Crea una nueva contraseña segura para tu cuenta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}