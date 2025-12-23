import { prisma } from "@/lib/db/prisma"
import { verifyJwt } from "@/lib/auth/jwt"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { FormStatus } from "@/lib/constants/statusTypes"
import { v4 as uuidv4 } from 'uuid';

// PATCH /api/forms/[formId]
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const payload = await verifyJwt(token)
        if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

        const { formId } = await params
        const body = await req.json()

        // [MODIFICADO] Extraemos también los campos booleanos
        const { status, title, description, bannerImageUrl, allowMultipleResponses, requiresLogin } = body

        // Verificar propiedad
        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 })

        if (form.ownerId !== payload.id) {
            return NextResponse.json({ error: "No tienes permisos" }, { status: 403 })
        }

        // Validar status si se envía
        if (status && !Object.values(FormStatus).includes(status)) {
            return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
        }

        // Lógica de Publicación Automática
        if (status === FormStatus.PUBLISHED) {
            const existingInvitation = await prisma.invitation.findFirst({
                where: { formId: formId }
            });

            if (!existingInvitation) {
                await prisma.invitation.create({
                    data: {
                        formId: formId,
                        token: uuidv4(),
                        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    }
                });
            }
        }

        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(bannerImageUrl !== undefined && { bannerImageUrl }),
                // [NUEVO] Actualizar configuraciones booleanas si vienen en el body
                ...(allowMultipleResponses !== undefined && { allowMultipleResponses }),
                ...(requiresLogin !== undefined && { requiresLogin }),
            }
        })

        return NextResponse.json(updatedForm)

    } catch (error) {
        console.error("Error updating form:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

// ... El método DELETE queda igual
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ formId: string }> }
) {
    // (Tu código DELETE existente va aquí tal cual estaba)
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

        const payload = await verifyJwt(token)
        if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

        const { formId } = await params

        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 })

        if (form.ownerId !== payload.id) {
            return NextResponse.json({ error: "No tienes permisos para eliminar este formulario" }, { status: 403 })
        }

        await prisma.form.delete({
            where: { id: formId }
        })

        return NextResponse.json({ message: "Formulario eliminado correctamente" })

    } catch (error) {
        console.error("Error deleting form:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}