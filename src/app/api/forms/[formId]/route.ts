import { prisma } from "@/lib/db/prisma"
import { verifyJwt } from "@/lib/auth/jwt"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { FormStatus } from "@/lib/constants/statusTypes"

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

        const { status, title, description, bannerImageUrl } = body

        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 })

        if (form.ownerId !== payload.id) {
            return NextResponse.json({ error: "No tienes permisos" }, { status: 403 })
        }

        if (status && !Object.values(FormStatus).includes(status)) {
            return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
        }

        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(bannerImageUrl !== undefined && { bannerImageUrl })
            }
        })

        return NextResponse.json(updatedForm)

    } catch (error) {
        console.error("Error updating form:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

// [NUEVO] Método DELETE para eliminar formularios
export async function DELETE(
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

        // Verificar existencia y propiedad
        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 })

        if (form.ownerId !== payload.id) {
            return NextResponse.json({ error: "No tienes permisos para eliminar este formulario" }, { status: 403 })
        }

        // Eliminar formulario (gracias al Cascade en schema.prisma, esto borrará preguntas y respuestas)
        await prisma.form.delete({
            where: { id: formId }
        })

        return NextResponse.json({ message: "Formulario eliminado correctamente" })

    } catch (error) {
        console.error("Error deleting form:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}