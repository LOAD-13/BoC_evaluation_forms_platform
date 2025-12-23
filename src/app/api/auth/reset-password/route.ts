import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/hash";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        // Buscar usuario con ese token y que no haya expirado
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // Expiry > Ahora (No expirado)
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
        }

        // Hashear nueva contraseña
        const passwordHash = await hashPassword(password);

        // Actualizar usuario y limpiar token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ success: true, message: "Contraseña actualizada" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}