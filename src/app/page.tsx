import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, BarChart3, ShieldCheck } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <FileText className="h-6 w-6 text-primary" />
                        <span>EvalPlatform</span>
                    </div>
                    <nav className="flex gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Iniciar Sesión</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Registrarse</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
                    <div className="flex max-w-[980px] flex-col items-start gap-2">
                        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                            Gestión de Evaluaciones <br className="hidden sm:inline" />
                            Simple, Segura y Escalable.
                        </h1>
                        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
                            Crea exámenes, encuestas y pruebas de capacitación en minutos.
                            Analiza resultados en tiempo real y gestiona usuarios con facilidad.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/register">
                            <Button size="lg" className="h-11 px-8">
                                Comenzar Gratis
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="h-11 px-8">
                                Ingresar al Demo
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50 rounded-3xl my-8">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                            Características Principales
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            Todo lo que necesitas para evaluar a tu equipo o estudiantes.
                        </p>
                    </div>

                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Seguridad Total</CardTitle>
                                <CardDescription>
                                    Protección de datos y control de acceso seguro para exámenes sensibles.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Analíticas en Vivo</CardTitle>
                                <CardDescription>
                                    Dashboards detallados con métricas de rendimiento y progreso.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Fácil Gestión</CardTitle>
                                <CardDescription>
                                    Interfaz intuitiva para crear formularios y gestionar usuarios.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with Next.js 16 & shadcn/ui.
                    </p>
                </div>
            </footer>
        </div>
    );
}