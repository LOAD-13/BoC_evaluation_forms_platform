import { z } from "zod";

export const createFormSchema = z.object({
    title: z.string().min(1, "El título es obligatorio"),
    description: z.string().optional(),
    type: z.enum(["EXAM", "SURVEY"]).default("EXAM"),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;