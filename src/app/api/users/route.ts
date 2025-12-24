import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
// [NUEVOS IMPORTS] Necesarios para crear usuario
import { hashPassword } from "@/lib/auth/hash";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";

// --- TU CÓDIGO ACTUAL (GET) ---
// Sirve para obtener la lista de usuarios
export async function GET(request: NextRequest) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                roles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: { fullName: 'asc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// --- LO NUEVO QUE DEBES AGREGAR (POST) ---
// Sirve para crear un usuario nuevo desde el panel de admin
export async function POST(req: NextRequest) {
    try {
        // 1. Seguridad: Verificar que quien llama es ADMIN
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyJwt(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const { fullName, email, password, role } = body;

        // 2. Validaciones básicas
        if (!fullName || !email || !password || !role) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        // 3. Verificar si el correo ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
        }

        // 4. Crear usuario en la base de datos
        const hashedPassword = await hashPassword(password);

        // Buscamos el rol en la BD para obtener su ID (asegúrate de que los roles existan en tu tabla 'roles')
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });

        if (!roleRecord) {
            return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash: hashedPassword,
                roles: {
                    create: {
                        roleId: roleRecord.id
                    }
                }
            }
        });

        return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email } });

    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}