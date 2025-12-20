import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, BarChart2, Eye } from "lucide-react"

export default function FormCard({ form }: { form: any }) {
    const isPublished = form.isPublished

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge
                        variant="outline"
                        className={isPublished
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                        }
                    >
                        {isPublished ? "Publicado" : "Borrador"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <CardTitle className="line-clamp-1 mt-2">{form.title}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                    {form.description || "Sin descripción"}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="text-sm text-slate-500">
                    {form._count?.responses || 0} respuestas recibidas
                </div>
            </CardContent>

            <CardFooter className="grid grid-cols-3 gap-2 border-t pt-4 bg-slate-50/50">
                <Link href={`/forms/${form.id}/edit`} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                </Link>
                <Link href={`/forms/${form.id}/results`} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">
                        <BarChart2 className="h-4 w-4 mr-2" /> Resultados
                    </Button>
                </Link>
                {isPublished && (
                    <Link href={`/f/${form.publicToken}`} target="_blank" className="w-full">
                        <Button variant="ghost" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" /> Ver
                        </Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    )
}