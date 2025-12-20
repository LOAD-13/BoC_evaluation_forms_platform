import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { z } from 'zod';

const updateFormSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    bannerImageUrl: z.string().optional(), // Añade esto para el banner
    isPublished: z.boolean().optional(),
});

// GET: Obtener formulario con sus preguntas y opciones
export async function GET(
    request: Request,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                questions: {
                    orderBy: { id: 'asc' },
                    include: {
                        options: {
                            orderBy: { id: 'asc' }
                        }
                    }
                }
            }
        });

        if (!form) return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
        if (form.ownerId !== user.id) return NextResponse.json({ error: 'Prohibido' }, { status: 403 });

        return NextResponse.json(form);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// PATCH: Actualizar título, descripción o estado
export async function PATCH(
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
        const validation = updateFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        // Verificar propiedad
        const existingForm = await prisma.form.findUnique({ where: { id: formId } });
        if (!existingForm || existingForm.ownerId !== user.id) {
            return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
        }

        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                ...validation.data,
                status: validation.data.isPublished ? 'PUBLISHED' : existingForm.status
            }
        });

        return NextResponse.json(updatedForm);
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }
} // ✅ Cierra PATCH correctamente aquí

// DELETE: Eliminar formulario (función independiente, fuera de PATCH)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ formId: string }> }
) {
    try {
        const { formId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await verifyJWT(token) : null;

        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const existingForm = await prisma.form.findUnique({ where: { id: formId } });
        if (!existingForm || existingForm.ownerId !== user.id) {
            return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
        }

        await prisma.form.delete({ where: { id: formId } });

        return NextResponse.json({ message: 'Formulario eliminado' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }
}
