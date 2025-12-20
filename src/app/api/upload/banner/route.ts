import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';

export async function POST(request: Request) {
    try {
        // 1. Verificar sesión
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const user = token ? await verifyJWT(token) : null;
        if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        // 2. Procesar el archivo
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 3. Crear nombre único y ruta
        // Usamos timestamp para evitar nombres duplicados
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const uploadDir = join(process.cwd(), 'public/uploads/banners');

        // Asegurar que la carpeta existe
        await mkdir(uploadDir, { recursive: true });

        const filepath = join(uploadDir, filename);

        // 4. Guardar archivo en disco
        await writeFile(filepath, buffer);

        // 5. Devolver la URL pública
        const fileUrl = `/uploads/banners/${filename}`;
        return NextResponse.json({ url: fileUrl });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
    }
}