import { prisma } from "@/lib/db/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import FormCard from "./_components/FormCard"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function FormsPage() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) redirect("/login")

    const payload = await verifyJwt(token)
    if (!payload) redirect("/login")

    const role = payload.role as string
    const userId = payload.id as string

    let forms: any[] = []

    if (role === 'ADMIN') {
        // ADMIN: Traer todos sus formularios
        forms = await prisma.form.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { responses: true }
                },
                invitations: {
                    take: 1
                }
            }
        })
    } else {
        // USER: Lógica Estricta de Negocio
        // 1. El estado del Formulario debe ser PUBLISHED
        // 2. Debe existir una asignación para este usuario
        const publishedForms = await prisma.form.findMany({
            where: {
                status: 'PUBLISHED', // Usando string literal por ahora si prisma no importa el Enum, o el valor string equivalente
                assignments: {
                    some: { userId: userId }
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                invitations: {
                    take: 1 // Token para el link
                },
                responses: {
                    where: { userId: userId }, // Ver si usuario ya respondió
                    include: {
                        evaluation: true // Para ver la nota
                    },
                    take: 1
                }
            }
        })

        // Mapear para cruzar datos
        forms = publishedForms.map(f => {
            const userResponse = f.responses[0]
            return {
                ...f,
                publicToken: f.invitations[0]?.token, // Token para el link
                userEvaluation: userResponse?.evaluation,
                hasResponse: !!userResponse
            }
        })
    }

    // Para Admin, también asegurar isPublished bool si FormCard lo espera
    if (role === 'ADMIN') {
        forms = forms.map(f => ({
            ...f,
            isPublished: f.status === 'PUBLISHED',
            publicToken: f.invitations[0]?.token
        }))
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {role === 'ADMIN' ? 'Mis Formularios' : 'Exámenes Disponibles'}
                    </h1>
                    <p className="text-muted-foreground">
                        {role === 'ADMIN' ? 'Gestiona tus exámenes y encuestas' : 'Lista de evaluaciones asignadas'}
                    </p>
                </div>
                {role === 'ADMIN' && (
                    <Link href="/forms/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Crear Nuevo
                        </Button>
                    </Link>
                )}
            </div>

            <div className="h-px bg-slate-200 my-4" />

            {forms.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium">No se encontraron formularios</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        {role === 'ADMIN' ? 'Empieza creando tu primera evaluación' : 'No hay exámenes activos en este momento.'}
                    </p>
                    {role === 'ADMIN' && (
                        <Link href="/forms/new">
                            <Button variant="outline">Crear ahora</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {forms.map((form) => (
                        <FormCard key={form.id} form={form} role={role} />
                    ))}
                </div>
            )}
        </div>
    )
}