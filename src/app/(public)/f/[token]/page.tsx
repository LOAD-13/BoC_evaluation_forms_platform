import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import FormRenderer from "./_components/FormRenderer";

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

    // 3. Crear una sesión de Respuesta (Response)
    // En un escenario real, deberíamos verificar si el usuario ya respondió si la invitación es única.
    // Aquí creamos una nueva Response vacía para tracking.
    const response = await prisma.response.create({
        data: {
            formId: invitation.formId,
            invitationId: invitation.id,
            // userId: si tuviéramos auth pública
            startedAt: new Date(),
        }
    });

    return <FormRenderer form={invitation.form} responseId={response.id} />;
}
