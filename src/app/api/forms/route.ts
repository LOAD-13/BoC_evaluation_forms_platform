import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import { formService } from "@/features/forms/services/formService";
import { createFormSchema } from "@/features/forms/schemas/formSchemas";

export async function POST(req: NextRequest) {
    try {
        // FIX: Agregar 'await' antes de cookies()
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const payload = await verifyJwt(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Token inválido" }, { status: 401 });
        }

        const body = await req.json();
        const validation = createFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
        }

        const newForm = await formService.createForm(validation.data, payload.id as string);
        return NextResponse.json(newForm, { status: 201 });

    } catch (error) {
        console.error("Error en API Forms:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}