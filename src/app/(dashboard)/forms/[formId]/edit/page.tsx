import FormEditor from "../../_components/FormEditor"
import { prisma } from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"

export default async function EditFormPage({ params }: { params: Promise<{ formId: string }> }) {
    // 1. Verificar Auth
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) redirect("/login")

    const payload = await verifyJwt(token)
    if (!payload || payload.role !== 'ADMIN') redirect("/login")

    const { formId } = await params

    // 2. Fetch Form Data with Questions
    const form = await prisma.form.findUnique({
        where: { id: formId },
        include: {
            questions: {
                orderBy: { id: 'asc' }, // Or createdAt if you prefer
                include: {
                    options: true
                }
            }
        }
    })

    if (!form) {
        return <div className="p-8 text-center text-red-500">Formulario no encontrado</div>
    }

    // Verificar ownership
    if (form.ownerId !== payload.id) {
        return <div className="p-8 text-center text-red-500">No tienes permisos para editar este formulario</div>
    }

    // Mapear datos al formato de UI
    const mappedQuestions = form.questions.map(q => ({
        id: q.id,
        text: q.questionText,
        type: q.questionType as "text" | "multiple" | "true_false",
        required: q.required,
        points: Number(q.score) || 0,
        options: q.options.map(o => ({
            text: o.optionText,
            isCorrect: o.isCorrect
        }))
    }))

    return (
        <div className="max-w-4xl mx-auto py-8">
            <FormEditor
                formId={formId}
                initialStatus={form.status}
                initialTitle={form.title}
                initialQuestions={mappedQuestions}
                initialDescription={form.description || ""}
                initialBannerUrl={form.bannerImageUrl}
            />
        </div>
    )
}
