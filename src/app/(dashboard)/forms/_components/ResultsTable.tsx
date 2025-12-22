"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, UserX } from "lucide-react" // UserX para el icono de anónimo
import Link from "next/link"

interface ResultRow {
    id: string;
    formId: string;
    startedAt: Date;
    finishedAt: Date | null;
    user: {
        email: string;
        fullName: string | null;
    } | null;
    evaluation: {
        totalScore: any;
        maxScore: any;
        passed: boolean;
    } | null;
}

interface ResultsTableProps {
    data: ResultRow[];
}

export default function ResultsTable({ data }: ResultsTableProps) {
    return (
        <div className="border rounded-md overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>Participante</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Nota</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Detalles</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                                No hay respuestas registradas aún.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => (
                            <TableRow key={row.id} className="hover:bg-slate-50/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {/* Avatar o Icono */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${row.user ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                            {row.user ? (
                                                <span className="font-bold text-xs">
                                                    {(row.user.fullName || row.user.email || "U").charAt(0).toUpperCase()}
                                                </span>
                                            ) : (
                                                <UserX className="h-4 w-4" />
                                            )}
                                        </div>

                                        {/* Nombre y Email - AQUÍ ESTÁ LA LÓGICA DE ANÓNIMO */}
                                        <div>
                                            <div className="font-medium text-sm">
                                                {row.user ? (row.user.fullName || "Usuario Registrado") : "Usuario Anónimo"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {row.user ? row.user.email : "Sin registro (Invitado)"}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="text-sm">
                                    {new Date(row.startedAt).toLocaleDateString()}
                                    <span className="text-xs text-gray-400 ml-1">
                                        {new Date(row.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    {row.evaluation ? (
                                        <span className="font-bold text-slate-700">
                                            {Number(row.evaluation.totalScore)} <span className="text-gray-400 font-normal text-xs">/ {Number(row.evaluation.maxScore)}</span>
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground italic text-xs">Incompleto</span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {row.evaluation ? (
                                        <Badge
                                            variant="outline"
                                            className={
                                                row.evaluation.passed
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                            }
                                        >
                                            {row.evaluation.passed ? "Aprobado" : "Reprobado"}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">En progreso</Badge>
                                    )}
                                </TableCell>

                                <TableCell className="text-right">
                                    <Link href={`/forms/${row.formId}/results/${row.id}`}>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <Eye className="h-4 w-4 text-slate-500" />
                                            <span className="sr-only">Ver</span>
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}