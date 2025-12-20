import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
    // 1. Obtener el token de la cookie
    const token = request.cookies.get('auth_token')?.value;

    // 2. Definir rutas protegidas (ej: dashboard)
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

    // 3. Verificar el token si existe
    const user = token ? await verifyJWT(token) : null;

    // CASO A: Usuario NO logueado intenta entrar a ruta protegida -> Mandar a login
    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // CASO B: Usuario YA logueado intenta entrar a login/registro -> Mandar a dashboard
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};