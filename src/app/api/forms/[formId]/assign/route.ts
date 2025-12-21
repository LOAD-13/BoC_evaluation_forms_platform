import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ formId: string }> }
) {
    const params = await props.params;
    try {
        const { userIds } = await request.json();
        const { formId } = params;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: "No user IDs provided" }, { status: 400 });
        }

        // Crear asignaciones ignorando duplicados
        // Prisma createMany con skipDuplicates no está soportado en todos los drivers,
        // pero en Postgres sí. Si falla, usaremos loop.

        let createdCount = 0;

        // Estrategia segura: Loop con upsert o create ignorando error
        // O mejor: Buscar existentes y filtrar
        const existingAssignments = await prisma.assignment.findMany({
            where: {
                formId,
                userId: { in: userIds }
            },
            select: { userId: true }
        });

        const existingUserIds = new Set(existingAssignments.map(a => a.userId));
        const newUserIds = userIds.filter(id => !existingUserIds.has(id));

        if (newUserIds.length > 0) {
            const result = await prisma.assignment.createMany({
                data: newUserIds.map((userId: string) => ({
                    formId,
                    userId,
                    status: 'PENDING'
                })),
                skipDuplicates: true
            });
            createdCount = result.count;
        }

        return NextResponse.json({
            message: "Assignments updated",
            added: createdCount,
            total: userIds.length
        });

    } catch (error) {
        console.error("Error creating assignments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ formId: string }> }
) {
    const params = await props.params;
    try {
        const { formId } = params;

        const assignments = await prisma.assignment.findMany({
            where: { formId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(assignments);

    } catch (error) {
        console.error("Error fetching assignments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
