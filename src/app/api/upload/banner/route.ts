import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No se ha subido ningún archivo" }, { status: 400 });
        }

        // Validar que sea imagen
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Generar nombre único para evitar colisiones
        const filename = `${uuidv4()}-${file.name.replace(/\s/g, "_")}`;

        // Asegurar que existe el directorio
        const uploadDir = path.join(process.cwd(), "public/uploads/banners");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignorar si ya existe
        }

        // Guardar archivo
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Retornar la URL pública
        const url = `/uploads/banners/${filename}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Error subiendo archivo:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}