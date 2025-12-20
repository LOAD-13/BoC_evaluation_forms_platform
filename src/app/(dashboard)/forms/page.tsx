"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Calendar, MoreVertical, Loader2 } from "lucide-react";
import { format } from "date-fns"; // Si no tienes date-fns, puedes usar JS nativo
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Form {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    _count: { responses: number };
}

export default function FormsPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/forms")
            .then((res) => res.json())
            .then((data) => {
                setForms(Array.isArray(data) ? data : []);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mis Formularios</h2>
                    <p className="text-muted-foreground">Gestiona tus exámenes y encuestas aquí.</p>
                </div>
                <Link href="/forms/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Crear Nuevo
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : forms.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">No tienes formularios creados</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Comienza creando tu primer examen o encuesta para evaluar a tus usuarios.
                        </p>
                        <Link href="/forms/new">
                            <Button>Crear mi primer formulario</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {forms.map((form) => (
                        <Card key={form.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant={form.status === "PUBLISHED" ? "default" : "secondary"}>
                                        {form.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link href={`/forms/${form.id}/edit`}>
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                            </Link>
                                            <Link href={`/forms/${form.id}/results`}>
                                                <DropdownMenuItem>Ver Resultados</DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="mt-2 line-clamp-1">{form.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3 w-3" />
                                    Creado el {new Date(form.createdAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    {form._count.responses} respuestas recibidas
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}