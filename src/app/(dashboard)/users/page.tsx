import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import UserTable from "./_components/UserTable";
// [CAMBIO 1] Importar el diálogo de creación
import { CreateUserDialog } from "./_components/CreateUserDialog";

export default async function UsersPage() {
    // 1. Verificar Autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const payload = await verifyJwt(token);
    if (!payload) redirect("/login");

    // 2. Verificar Rol de Admin
    if (payload.role !== 'ADMIN') {
        redirect("/dashboard");
    }

    // 3. Obtener usuarios
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.roles.length > 0 ? user.roles[0].role.name : 'USER',
        createdAt: user.createdAt,
        isActive: user.isActive
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>

                {/* [CAMBIO 2] Aquí colocamos el botón */}
                <CreateUserDialog />

            </div>

            <UserTable users={formattedUsers} />
        </div>
    );
}