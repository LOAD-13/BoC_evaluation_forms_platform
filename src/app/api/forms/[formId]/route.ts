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

        if (!token) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const payload = await verifyJwt(token)
        if (!payload) {
            return NextResponse.json({ error: "Token inválido" }, { status: 401 })
        }

        const { formId } = await params
        const body = await req.json()

        // [MODIFICADO] Agregamos bannerImageUrl a la desestructuración
        const { status, title, description, bannerImageUrl } = body

        // Verificar propiedad
        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form) {
            return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 })
        }

        if (form.ownerId !== payload.id) {
            return NextResponse.json({ error: "No tienes permisos" }, { status: 403 })
        }

        // Validar status si se envía
        if (status && !Object.values(FormStatus).includes(status)) {
            return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
        }

        // [MODIFICADO] Incluimos bannerImageUrl en la actualización
        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }), // Permite borrar descripción enviando string vacío
                ...(status && { status }),
                ...(bannerImageUrl !== undefined && { bannerImageUrl }) // Actualiza banner
            }
        })

        return NextResponse.json(updatedForm)

    } catch (error) {
        console.error("Error updating form:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}