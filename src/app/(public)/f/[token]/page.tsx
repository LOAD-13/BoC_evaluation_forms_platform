import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import FormRenderer from "./_components/FormRenderer";
import LogoutLink from "@/components/auth/LogoutLink";
import { UserCheck, AlertTriangle } from "lucide-react";
// [NUEVO] Import para el botón de login
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PublicFormPageProps {
    params: Promise<{ token: string }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
    const { token } = await params;

    // 1. Validar si existe la invitación
    const invitation = await prisma.invitation.findUnique({
        where: { token },
        include: {
            form: {
                include: {
                    questions: {
                        include: { options: true }
                    }
                }
            }
        }
    });

    if (!invitation) return notFound();

    // 2. Identificar al Usuario
    const cookieStore = await cookies();
    const authToken = cookieStore.get("token")?.value;
    let user = null;

    if (authToken) {
        const payload = await verifyJwt(authToken);
        if (payload && payload.id) {
            user = await prisma.user.findUnique({
                where: { id: payload.id as string }
            });
        }
    }

    // [NUEVO] 2.5 VALIDACIÓN DE LOGIN REQUERIDO
    if (invitation.form.requiresLogin && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Acceso Restringido</h1>
                        <p className="text-gray-500 mt-2">
                            Este formulario requiere que inicies sesión para responder.
                        </p>
                    </div>
                    <div className="border-t pt-6">
                        <Link href={`/login?callbackUrl=/f/${token}`}>
                            <Button className="w-full">Iniciar Sesión</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. BLOQUEO DE SEGURIDAD (Manejo de múltiples intentos)
    if (user && !invitation.form.allowMultipleResponses) {
        const existingResponse = await prisma.response.findFirst({
            where: {
                formId: invitation.formId,
                userId: user.id,
                finishedAt: { not: null }
            }
        });

        if (existingResponse) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Ya respondiste este formulario</h1>
                            <p className="text-gray-500 mt-2">
                                Este examen está configurado para permitir solo un intento.
                                <br />
                                Se ha registrado una respuesta para <span className="font-medium text-gray-900">{user.email}</span>.
                            </p>
                        </div>

                        <div className="border-t pt-6">
                            <p className="text-sm text-gray-400 mb-4">¿No eres tú o quieres intentar con otra cuenta?</p>
                            <div className="flex justify-center">
                                <LogoutLink />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // 4. Crear sesión de respuesta
    const response = await prisma.response.create({
        data: {
            formId: invitation.formId,
            invitationId: invitation.id,
            userId: user?.id,
            startedAt: new Date(),
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* BARRA SUPERIOR DE IDENTIDAD */}
            <div className="bg-white border-b px-4 py-3 shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {user ? (
                            <>
                                <div className="bg-blue-100 p-1 rounded-full">
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <span>Respondiendo como <strong>{user.email}</strong></span>
                            </>
                        ) : (
                            <span className="italic text-gray-400">Respondiendo como invitado (Anónimo)</span>
                        )}
                    </div>

                    {user && (
                        <LogoutLink />
                    )}
                </div>
            </div>

            {/* RENDERIZADOR */}
            <div className="flex-1">
                <FormRenderer
                    form={invitation.form}
                    responseId={response.id}
                    previewMode={false}
                />
            </div>
        </div>
    );
}