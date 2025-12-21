import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import FormRenderer from "./_components/FormRenderer";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";


interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function PublicFormPage({ params }: PageProps) {
    const { token } = await params;

    // 1. Validar Invitación
    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: {
            form: {
                include: {
                    questions: {
                        orderBy: { questionType: 'asc' }, // Ordenar si hubiera un campo 'order'
                        include: {
                            options: true
                        }
                    }
                }
            }
        }
    });

    if (!invitation) return notFound();

    // 2. Verificar vencimiento
    if (new Date() > invitation.expiresAt) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Enlace Expirado</h1>
                    <p>Esta invitación ha caducado.</p>
                </div>
            </div>
        );
    }

    // 3. Identificar Usuario (si está logueado)
    const cookieStore = await cookies()
    const authToken = cookieStore.get("token")?.value
    let userId: string | null = null

    if (authToken) {
        const payload = await verifyJwt(authToken)
        if (payload) {
            userId = payload.id as string

            // Auto-asignación para que le aparezca en el Dashboard
            await prisma.assignment.upsert({
                where: {
                    formId_userId: {
                        formId: invitation.formId,
                        userId: userId
                    }
                },
                update: {}, // Ya existe, no hacemos nada
                create: {
                    formId: invitation.formId,
                    userId: userId,
                    status: 'PENDING'
                }
            })
        }
    }

    // 4. Crear una sesión de Respuesta (Response)
    const response = await prisma.response.create({
        data: {
            formId: invitation.formId,
            invitationId: invitation.id,
            userId: userId, // Vinculamos al usuario si existe
            startedAt: new Date(),
        }
    });

    return <FormRenderer form={invitation.form} responseId={response.id} />;
}
