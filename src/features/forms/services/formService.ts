import { prisma } from "@/lib/db/prisma";
import { CreateFormInput } from "../schemas/formSchemas";

export const formService = {
    async createForm(data: CreateFormInput, userId: string) {
        return await prisma.form.create({
            data: {
                title: data.title,
                description: data.description,
                formType: data.type,
                ownerId: userId,
                status: "DRAFT", // Se crea como borrador por defecto
            },
        });
    },

    async getFormsByUser(userId: string) {
        return await prisma.form.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { responses: true },
                },
            },
        });
    },
};