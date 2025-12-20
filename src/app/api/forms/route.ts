import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { z } from 'zod';

// Esquema de validación para crear formulario
const createFormSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().optional(),
});

// GET: Obtener todos los formularios del usuario
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const forms = await prisma.form.findMany({
            where: { ownerId: user.id as string }, // Solo sus propios formularios
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { responses: true } // Contamos las respuestas para el dashboard
                }
            }
        });

        return NextResponse.json(forms);
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener formularios' }, { status: 500 });
    }
}

// POST: Crear un nuevo formulario
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const validation = createFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const newForm = await prisma.form.create({
            data: {
                title: validation.data.title,
                description: validation.data.description || "",
                ownerId: user.id as string,
                status: "DRAFT", // Por defecto nace como borrador
                formType: "EXAM", // O "SURVEY", podrías recibirlo del body también
            }
        });

        return NextResponse.json(newForm, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al crear el formulario' }, { status: 500 });
    }
}