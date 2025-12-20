import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecentForms() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Forms</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    <div className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">Formulario de evaluación</p>
                            <p className="text-sm text-muted-foreground">Creado hace 2 horas</p>
                        </div>
                        <div className="ml-auto font-medium">+15 respuestas</div>
                    </div>
                    <div className="flex items-center">
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">Encuesta de satisfacción</p>
                            <p className="text-sm text-muted-foreground">Creado ayer</p>
                        </div>
                        <div className="ml-auto font-medium">+42 respuestas</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
