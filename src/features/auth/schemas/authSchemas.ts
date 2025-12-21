import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    fullName: z.string().min(2, "El nombre es demasiado corto"),
});