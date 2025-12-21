import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const payload = await verifyJwt(token);
        if (!payload) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // Buscamos los datos frescos en la BD (por si cambió el nombre o rol)
        const user = await prisma.user.findUnique({
            where: { id: payload.id as string },
            select: {
                id: true,
                email: true,
                fullName: true,
                // roles: { include: { role: true } } // Si usas roles complejos
            }
        });

        if (!user) {
            return NextResponse.json({ user: null }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching me:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}