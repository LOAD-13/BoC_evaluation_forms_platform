import { z } from "zod";

// Schema para actualizar el formulario (PATCH)
export const updateFormSchema = z.object({
    title: z.string().min(1, "El título es requerido").optional(),
    description: z.string().optional().nullable(),
    // ¡ESTA ES LA LÍNEA QUE FALTA! 
    bannerImageUrl: z.string().optional().nullable(),
    status: z.enum(["draft", "published", "archived"]).optional(),
});