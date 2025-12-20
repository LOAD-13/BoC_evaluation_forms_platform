import { NextResponse } from 'next/server';
// FÍJATE AQUÍ: Agregamos las llaves { } alrededor de prisma
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/hash';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email("Formato de correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    fullName: z.string().min(2, "El nombre es muy corto"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = registerSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password, fullName } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este correo ya está registrado' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                fullName,
                roles: {
                    create: {
                        roleId: 1
                    }
                }
            },
            select: {
                id: true,
                email: true,
                fullName: true,
            }
        });

        return NextResponse.json({
            message: 'Usuario registrado exitosamente',
            user: newUser
        }, { status: 201 });

    } catch (error) {
        console.error('Error en registro:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}