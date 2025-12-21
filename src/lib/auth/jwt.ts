import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "secreto-de-desarrollo-muy-largo-y-seguro"
);

export async function signJwt(payload: any) { // signJwt en minúsculas
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);
}

export async function verifyJwt(token: string) { // verifyJwt en minúsculas
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}