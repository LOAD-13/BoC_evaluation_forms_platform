import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import { formService } from "@/features/forms/services/formService";
import { z } from "zod";

// Validación de entrada para guardar preguntas
const saveQuestionsSchema = z.array(
    z.object({
        id: z.string().or(z.number()).optional(),
        text: z.string().min(1, "El texto de la pregunta es obligatorio"),
        type: z.enum(["text", "multiple", "true_false", "scale"]),
        required: z.boolean(),
        points: z.number().optional(), // Agregar validación para puntos
        options: z.array(z.object({
            text: z.string(),
            isCorrect: z.boolean().optional()
        })).optional(),
    })
);

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ formId: string }> }
) {
    try {
        const params = await context.params;
        const { formId } = params;

        // 1. Verificar Autenticación
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

        const payload = await verifyJwt(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Token inválido" }, { status: 401 });
        }

        // 2. Verificar que el usuario sea dueño del formulario
        const forms = await formService.getFormsByUser(payload.id as string);
        const form = forms.find((f) => f.id === formId);

        if (!form) {
            return NextResponse.json({ error: "Formulario no encontrado o sin permisos" }, { status: 404 });
        }

        // 3. Validar payload
        const body = await req.json();
        const validation = saveQuestionsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        // 4. Guardar preguntas
        await formService.saveQuestions(formId, validation.data);

        return NextResponse.json({ message: "Preguntas guardadas correctamente" });

    } catch (error) {
        console.error("Error guardando preguntas:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
