import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/auth/jwt'; // Cambiado de verifyJWT a verifyJwt

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Rutas que requieren autenticación
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/forms');

    // Verificar el token si existe
    const user = token ? await verifyJwt(token) : null;

    // Redirigir si no está logueado y va a ruta protegida
    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/forms/:path*'],
};