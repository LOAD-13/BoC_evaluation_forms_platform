import { prisma } from "@/lib/db/prisma";

export const cloneForm = async (originalFormId: string, userId: string) => {
    // 1. Buscar el formulario original con todas sus preguntas y opciones
    const originalForm = await prisma.form.findUnique({
        where: { id: originalFormId },
        include: {
            questions: {
                include: { options: true }
            }
        }
    });

    if (!originalForm) throw new Error("Formulario no encontrado");

    // Verificación de seguridad básica (opcional: permitir clonar públicos)
    if (originalForm.ownerId !== userId) throw new Error("No tienes permiso para copiar este formulario");

    // 2. Crear el nuevo formulario usando una "transacción anidada" de Prisma
    // Esto crea el Form, sus Questions y sus Options en un solo paso.
    const newForm = await prisma.form.create({
        data: {
            title: `${originalForm.title} (Copia)`,
            description: originalForm.description,
            formType: originalForm.formType,
            status: "DRAFT", // IMPORTANTE: Siempre nace como borrador
            ownerId: userId,   // El dueño es quien lo clona
            bannerImageUrl: originalForm.bannerImageUrl,
            clonedFrom: originalForm.id,
            allowMultipleResponses: originalForm.allowMultipleResponses, // Copiamos la configuración

            // Magia de Prisma: Copiar relaciones anidadas
            questions: {
                create: originalForm.questions.map(q => ({
                    questionText: q.questionText,
                    questionType: q.questionType,
                    score: q.score,
                    required: q.required,
                    imageUrl: q.imageUrl,
                    options: {
                        create: q.options.map(opt => ({
                            optionText: opt.optionText,
                            isCorrect: opt.isCorrect
                        }))
                    }
                }))
            }
        }
    });

    return newForm;
};