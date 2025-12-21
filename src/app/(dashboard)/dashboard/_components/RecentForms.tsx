import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface RecentFormsProps {
    forms: any[]; // Idealmente usar un tipo generado por Prisma
}

export default function RecentForms({ forms }: RecentFormsProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Formularios Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {forms.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay formularios recientes.</p>
                    ) : (
                        forms.map((form) => (
                            <div className="flex items-center" key={form.id}>
                                <div className="ml-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium leading-none">{form.title}</p>
                                        <Badge variant={form.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                                            {form.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(form.createdAt), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    {form._count?.responses || 0} respuestas
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
