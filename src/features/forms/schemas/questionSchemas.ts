import { z } from "zod";

export const questionTypeSchema = z.enum([
    "text",
    "multiple",
    "checkbox",
    "true_false",
    "scale",
]);

export const questionSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    text: z.string().min(1, "El texto de la pregunta es requerido"),
    type: questionTypeSchema, // zod ya valida que sea uno de esos valores
    required: z.boolean().default(true),
    points: z.number().min(0).default(1),
    options: z
        .array(
            z.object({
                text: z.string().optional(),
                isCorrect: z.boolean().default(false),
            })
        )
        .optional(),
});

// Esquema para validar el array completo de preguntas
export const saveQuestionsSchema = z.array(questionSchema);
