import { SignJWT, jwtVerify } from 'jose';

// En producción, esto debe venir de una variable de entorno (.env)
const SECRET_KEY = process.env.JWT_SECRET || 'clave-secreta-desarrollo-123';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signJWT(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // La sesión dura 24 horas
        .sign(key);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload;
    } catch (error) {
        return null;
    }
}