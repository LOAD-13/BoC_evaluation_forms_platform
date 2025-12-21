import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";
import FormRenderer from "@/app/(public)/f/[token]/_components/FormRenderer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PreviewPageProps {
    params: Promise<{ formId: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
    const { formId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) redirect("/login");

    const payload = await verifyJwt(token);
    if (!payload) redirect("/login");

    const formFromDb = await prisma.form.findUnique({
        where: { id: formId },
        include: {
            questions: {
                orderBy: { id: "asc" },
                include: { options: true },
            },
        },
    });

    if (!formFromDb || formFromDb.ownerId !== payload.id) return notFound();

    // 🔧 SERIALIZAR para el cliente (sin Decimal)
    const form = {
        ...formFromDb,
        // si quieres también createdAt como string:
        // createdAt: formFromDb.createdAt.toISOString(),
        questions: formFromDb.questions.map((q) => ({
            ...q,
            // Prisma.Decimal -> number o string
            score: q.score !== null ? Number(q.score) : null,
            // si tienes fechas en preguntas, también conviértelas aquí
        })),
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <Link href={`/forms/${formId}/edit`}>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Editor
                        </Button>
                    </Link>
                    <span className="font-semibold text-sm uppercase tracking-wide bg-indigo-700 px-3 py-1 rounded-full">
                        Modo Vista Previa
                    </span>
                </div>
                <p className="text-xs opacity-80 hidden md:block">
                    Las respuestas enviadas aquí no se guardarán.
                </p>
            </div>

            <div className="flex-1">
                <FormRenderer
                    form={form}
                    previewMode={true}
                />
            </div>
        </div>
    );
}
