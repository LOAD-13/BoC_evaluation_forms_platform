import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { z } from 'zod';

const createQuestionSchema = z.object({
    questionText: z.string().min(1, "La pregunta no puede estar vacía"),
    questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "OPEN_ENDED", "SCALE"]),
    score: z.number().min(0).default(0),
    required: z.boolean().default(true),
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const body = await request.json();
        const validation = createQuestionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        // Crear la pregunta
        const question = await prisma.question.create({
            data: {
                formId,
                questionText: validation.data.questionText,
                questionType: validation.data.questionType,
                score: validation.data.score,
                required: validation.data.required,
            }
        });

        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: 'Error al crear la pregunta' }, { status: 500 });
    }
}