import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("token"); // O el nombre que uses para tu cookie de sesión

        return NextResponse.json({ message: "Logout exitoso" });
    } catch (error) {
        return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
    }
}