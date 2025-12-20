import { hash, compare } from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
    // 12 rondas de sal es un estándar seguro hoy en día
    return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
}