import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
    try {
        // En un escenario real, validaríamos que el request venga de un ADMIN.
        // Por simplicidad, asumimos middlewares protegen o verificamos aquí.

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
