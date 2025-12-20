import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import FormCard from "./_components/FormCard"
import { Separator } from "@/components/ui/separator" // Si no existe, puedes quitar esta línea y el <Separator />

export const dynamic = 'force-dynamic'

export default async function FormsPage() {
    // Buscamos todos los formularios (en el futuro filtrarás por usuario logueado)
    const forms = await prisma.form.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { responses: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Formularios</h1>
                    <p className="text-muted-foreground">Gestiona tus exámenes y encuestas</p>
                </div>
                <Link href="/forms/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Crear Nuevo
                    </Button>
                </Link>
            </div>

            {/* Si usaste shadcn separator y lo tienes instalado */}
            <div className="h-px bg-slate-200 my-4" />

            {forms.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">No tienes formularios creados</h3>
                    <p className="text-sm text-slate-500 mb-4">Empieza creando tu primera evaluación</p>
                    <Link href="/forms/new">
                        <Button variant="outline">Crear ahora</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {forms.map((form) => (
                        <FormCard key={form.id} form={form} />
                    ))}
                </div>
            )}
        </div>
    )
}