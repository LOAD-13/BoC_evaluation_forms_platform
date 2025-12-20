import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth/jwt"; // Asegúrate de que esta ruta sea correcta
import { formService } from "@/features/forms/services/formService";
import { createFormSchema } from "@/features/forms/schemas/formSchemas";

export async function POST(req: NextRequest) {
    try {
        // 1. Verificar Autenticación
        // Nota: Next.js 15+ requiere 'await' en cookies(), pero en versiones 13/14 es síncrono.
        // Si te da error, prueba: const cookieStore = await cookies();
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Token inválido" }, { status: 401 });
        }

        // 2. Obtener y Validar Datos
        const body = await req.json();
        const validation = createFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        // 3. Crear el Formulario
        const newForm = await formService.createForm(validation.data, payload.id as string);

        return NextResponse.json(newForm, { status: 201 });

    } catch (error) {
        console.error("Error creando formulario:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}