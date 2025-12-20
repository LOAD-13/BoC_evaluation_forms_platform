import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/hash';
import { signJWT } from '@/lib/auth/jwt';
import { z } from 'zod';
import { cookies } from 'next/headers'; // Para guardar la sesión automáticamente

const loginSchema = z.object({
    email: z.string().email("Correo inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validar datos de entrada
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        // 2. Buscar usuario en la BD
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Por seguridad, no decimos si el usuario no existe o la contraseña está mal
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // 3. Verificar contraseña
        const isValidPassword = await verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // 4. Si todo está bien, generamos el token
        const token = await signJWT({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: 'user' // Aquí podrías agregar lógica para roles reales
        });

        // 5. Guardamos el token en una Cookie HTTPOnly (Más seguro que localStorage)
        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true, // No accesible por JavaScript del navegador (anti-XSS)
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 día en segundos
            path: '/',
        });

        // 6. Respondemos éxito (pero sin devolver el token en el JSON, ya va en la cookie)
        return NextResponse.json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}