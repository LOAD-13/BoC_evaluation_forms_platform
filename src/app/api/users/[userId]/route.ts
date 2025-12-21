import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await verifyJwt(token);
        // Permitir si es Admin O si el usuario se edita a sí mismo
        if (!requester || (requester.role !== "ADMIN" && requester.id !== userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        // Extraemos solo lo que permitimos editar
        const { role, fullName } = body;

        // Validación básica
        if (requester.role !== "ADMIN" && role) {
            return NextResponse.json({ error: "No puedes cambiar tu propio rol" }, { status: 403 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(role && { role }),         // Solo actualiza si viene el dato
                ...(fullName && { fullName }), // Solo actualiza si viene el dato
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}