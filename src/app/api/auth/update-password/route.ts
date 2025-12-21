import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyJwt } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs"; // Asegúrate de tener bcryptjs instalado

export async function POST(req: Request) {
    try {
        // 1. Verificar sesión
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

        const payload = await verifyJwt(token);
        if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        // 2. Buscar usuario y verificar contraseña actual
        const user = await prisma.user.findUnique({ where: { id: payload.id as string } });

        if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        const isValid = await compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
        }

        // 3. Hashear nueva contraseña y guardar
        const newHash = await hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
        });

        return NextResponse.json({ message: "Contraseña actualizada" });

    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}