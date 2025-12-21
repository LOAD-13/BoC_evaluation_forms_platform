"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast"; // Hook para notificaciones
import { useRouter } from "next/navigation"; // Para recargar la tabla

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: Date;
    isActive: boolean;
}

interface UserTableProps {
    users: User[];
    currentUserRole?: string; // Opcional: para saber si el que ve esto es superadmin
}

export default function UserTable({ users }: UserTableProps) {
    const { toast } = useToast();
    const router = useRouter();

    // Función que conecta con el backend para cambiar el rol
    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error("Error al actualizar");

            toast({ title: "Rol actualizado correctamente" });
            router.refresh(); // Recarga los datos de la tabla sin recargar la página
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cambiar el rol.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="rounded-md border bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Registro</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No se encontraron usuarios.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>

                                {/* AQUI ESTA EL CAMBIO PRINCIPAL: BADGE -> SELECT */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(val) => handleRoleChange(user.id, val)}
                                        >
                                            <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                                <SelectItem value="USER">Usuario</SelectItem>
                                                {/* Agrega más roles si tu sistema los tiene */}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant={user.isActive ? "secondary" : "destructive"}>
                                        {user.isActive ? "Activo" : "Inactivo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {format(new Date(user.createdAt), "dd MMM yyyy", { locale: es })}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}