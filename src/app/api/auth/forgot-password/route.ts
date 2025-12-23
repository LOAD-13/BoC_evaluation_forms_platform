import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // Buscamos usuario (sin revelar si existe o no por seguridad)
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Respondemos success igual para no filtrar usuarios registrados
            return NextResponse.json({ success: true, message: "Si el correo existe, se envió un enlace." });
        }

        // Generar token criptográfico seguro
        const resetToken = crypto.randomBytes(32).toString("hex");
        // Expiración: 1 hora desde ahora
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        // Guardar en BD
        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        });

        // --- SIMULACIÓN DE ENVÍO DE CORREO (LOG EN CONSOLA) ---
        // En producción, aquí usarías SendGrid, Resend, Nodemailer, etc.
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        console.log("\n========================================");
        console.log("📧 EMAIL SIMULADO DE RECUPERACIÓN 📧");
        console.log(`Para: ${email}`);
        console.log(`Link: ${resetLink}`);
        console.log("========================================\n");

        return NextResponse.json({
            success: true,
            message: "Correo enviado",
            debugToken: resetToken // Solo dev
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}