import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { compareHash } from "@/lib/auth/hash";
import { signJwt } from "@/lib/auth/jwt"; // FIX: Cambiado de signJWT a signJwt
import { loginSchema } from "@/features/auth/schemas/authSchemas";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Validar esquema
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // 2. Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Credenciales incorrectas" },
                { status: 401 }
            );
        }

        // 3. Verificar contraseña (usando passwordHash de la BD)
        const isPasswordCorrect = await compareHash(password, user.passwordHash);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                { error: "Credenciales incorrectas" },
                { status: 401 }
            );
        }

        // Determinar rol (tomamos el primero o USER por defecto)
        const userRole = user.roles.length > 0 ? user.roles[0].role.name : 'USER';

        // 4. Generar el token (FIX: usar signJwt)
        const token = await signJwt({
            id: user.id,
            email: user.email,
            role: userRole,
        });

        // 5. Configurar la cookie (FIX: cookies() es asíncrono en Next 16)
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 día
        });

        return NextResponse.json({
            message: "Login exitoso",
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: userRole,
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}