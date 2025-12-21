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
            where: { ownerId: userId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { responses: true },
                },
            },
        });
    },


    async saveQuestions(formId: string, questions: any[]) {
        return await prisma.$transaction(async (tx) => {
            // 1. Borrar preguntas existentes (Estrategia: Full Replace)
            // Esto borra respuestas asociadas si ya el formulario fue respondido y no hay protección en BD.
            await tx.question.deleteMany({
                where: { formId }
            });

            // 2. Crear nuevas preguntas
            for (const q of questions) {
                const createdQuestion = await tx.question.create({
                    data: {
                        formId,
                        questionText: q.text,
                        questionType: q.type,
                        required: q.required,
                        score: q.points || 0, // Persistir puntaje
                    }
                });

                // 3. Crear opciones si es multiple choice
                if (q.options && q.options.length > 0) {
                    await tx.questionOption.createMany({
                        data: q.options.map((opt: any) => ({
                            questionId: createdQuestion.id,
                            optionText: typeof opt === 'string' ? opt : opt.text, // Compatibilidad si llega como string o objeto
                            isCorrect: typeof opt === 'string' ? false : (opt.isCorrect || false)
                        }))
                    });
                }
            }
        });
    }
};