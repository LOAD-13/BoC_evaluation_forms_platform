import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import { cloneForm } from "@/features/forms/services/cloneService";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        // 1. Auth
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

        const payload = await verifyJwt(token);
        if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

        const { formId } = await params;

        // 2. Ejecutar clonación
        const newForm = await cloneForm(formId, payload.id as string);

        return NextResponse.json({
            success: true,
            data: newForm,
            redirectUrl: `/forms/${newForm.id}/edit` // Devolvemos la ruta para redirigir
        });

    } catch (error) {
        console.error("Error cloning form:", error);
        return NextResponse.json({ error: "Error interno al clonar" }, { status: 500 });
    }
}