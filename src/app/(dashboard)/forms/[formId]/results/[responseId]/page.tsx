import { prisma } from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth/jwt"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"

export default async function ResponseDetailPage({
    params
}: {
    params: Promise<{ formId: string, responseId: string }>
}) {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) redirect("/login")

    const payload = await verifyJwt(token)
    if (!payload) redirect("/login")

    const { formId, responseId } = await params

    // 1. Fetch Data Completa
    // Necesitamos: Response, Details, Evaluation, User info
    // Y también: Form, Questions, Options (para saber cuál era la correcta)

    // Fetch Response first with details
    const response = await prisma.response.findUnique({
        where: { id: responseId },
        include: {
            details: true,
            evaluation: true,
            form: {
                select: {
                    title: true,
                    ownerId: true,
                    questions: {
                        include: {
                            options: true // Para comparar respuestas
                        },
                        orderBy: { id: 'asc' } // O por un campo order si existiera
                    }
                }
            },
            // Prisma no permite join directo fácil de User si la relación es opcional a veces, 
            // pero assignments son usuarios registrados.
            // Para encontrar el usuario, usamos la relación hipotética si existe en schema, 
            // o hacemos fetch separado si tenemos userId.
        }
    })

    if (!response || !response.form) {
        return <div>Respuesta no encontrada</div>
    }

    // Verificar permisos: Solo el dueño del form (Admin) debería ver esto aquí
    if (response.form.ownerId !== payload.id) {
        return <div>No autorizado</div>
    }

    var userDisplay = "Usuario Anónimo";
    if (response.userId) {
        const user = await prisma.user.findUnique({ where: { id: response.userId } })
        if (user) userDisplay = user.fullName;
    }

    // Prepare helper map for quick access to user answers
    const answersMap = new Map();
    response.details.forEach(d => {
        answersMap.set(d.questionId, d);
    });

    const evalData = response.evaluation;

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-6">
            <Link href={`/forms/${formId}/results`}>
                <Button variant="ghost" className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Resultados Globales
                </Button>
            </Link>

            {/* Header / Student Score Card */}
            <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{userDisplay}</h2>
                        <p className="text-muted-foreground">{response.form.title}</p>
                    </div>
                    {evalData && (
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Nota Final</div>
                                <div className={`text-3xl font-bold ${evalData.passed ? "text-green-600" : "text-red-600"}`}>
                                    {Number(evalData.totalScore)} / {Number(evalData.maxScore)}
                                </div>
                            </div>
                            <div>
                                {evalData.passed ? (
                                    <Badge className="text-lg px-4 py-1 bg-green-500 hover:bg-green-600">APROBADO</Badge>
                                ) : (
                                    <Badge variant="destructive" className="text-lg px-4 py-1">REPROBADO</Badge>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Exam Content Review */}
            <div className="space-y-6">
                {response.form.questions.map((q, index) => {
                    const userAnswer = answersMap.get(q.id);

                    // Buscar opción correcta y seleccionada
                    const correctOption = q.options.find(o => o.isCorrect);
                    const userSelectedOptionId = userAnswer?.selectedOptionId;

                    // --- NUEVA LÓGICA UNIFICADA ---
                    let isCorrect = false;
                    let userAnswerText = "Sin respuesta";

                    if (
                        q.questionType === "multiple" ||
                        q.questionType === "true_false" ||
                        q.questionType === "MULTIPLE_CHOICE" ||
                        q.questionType === "TRUE_FALSE"
                    ) {
                        const selectedOption = q.options.find(
                            (opt) => opt.id === userSelectedOptionId
                        );
                        userAnswerText = selectedOption?.optionText || "No seleccionó nada";
                        isCorrect = selectedOption?.isCorrect || false;
                    } else if (
                        q.questionType === "text" ||
                        q.questionType === "OPEN_ENDED"
                    ) {
                        userAnswerText = userAnswer?.answerText || "";
                        isCorrect = true; // las abiertas las marcas como neutras/correctas
                    } else if (
                        q.questionType === "scale" ||
                        q.questionType === "SCALE"
                    ) {
                        // --- BLOQUE NUEVO PARA ESCALA ---
                        userAnswerText = userAnswer?.answerText
                            ? `Valor seleccionado: ${userAnswer.answerText}`
                            : "Sin respuesta";
                        isCorrect = true; // opinión, no se considera incorrecta
                    }

                    // Si la pregunta es de opinión (0 puntos), usamos estilo neutro
                    const isOpinion =
                        q.score === null || Number(q.score) === 0;

                    const cardColorClass = isOpinion
                        ? "border-gray-200 bg-white"
                        : isCorrect
                            ? "border-green-200 bg-green-50/30"
                            : "border-red-200 bg-red-50/30";

                    return (
                        <Card key={q.id} className={cardColorClass}>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg flex gap-2">
                                        <span className="text-muted-foreground">
                                            {index + 1}.
                                        </span>
                                        {q.questionText}
                                    </h3>

                                    {/* Badge Correcto/Incorrecto solo si no es opinión */}
                                    {q.questionType !== "text" && !isOpinion && (
                                        <div>
                                            {isCorrect ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-700 border-green-300 bg-green-100 flex gap-1"
                                                >
                                                    <CheckCircle className="h-3 w-3" /> Correcto
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-red-700 border-red-300 bg-red-100 flex gap-1"
                                                >
                                                    <XCircle className="h-3 w-3" /> Incorrecto
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Render Options / Texto / Escala */}
                                {q.questionType !== "text" && q.questionType !== "OPEN_ENDED" ? (
                                    q.questionType === "scale" || q.questionType === "SCALE" ? (
                                        // --- SOLO ESCALA: bolitas, sin tocar multiple choice ---
                                        <div className="mt-3 p-4 bg-slate-50 rounded-lg border flex flex-col gap-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase">
                                                Selección del usuario:
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {[1, 2, 3, 4, 5].map((val) => {
                                                    // OJO: aquí usamos la respuesta cruda, sin "Valor seleccionado: ..."
                                                    const rawValue = userAnswer?.answerText || "";
                                                    const isSelected = rawValue === val.toString();

                                                    return (
                                                        <div
                                                            key={val}
                                                            className={cn(
                                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all",
                                                                isSelected
                                                                    ? "bg-blue-600 text-white border-blue-600 scale-110 shadow-md"
                                                                    : "bg-white text-gray-400 border-gray-200"
                                                            )}
                                                        >
                                                            {val}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 italic">
                                                {userAnswer?.answerText
                                                    ? `Valoró con un ${userAnswer.answerText}/5`
                                                    : "No respondió"}
                                            </p>
                                        </div>
                                    ) : (
                                        // --- AQUÍ SIGUE TU LÓGICA ACTUAL DE OPCIONES (NO LA CAMBIES) ---
                                        <div className="space-y-2 pl-4">
                                            {q.options.map((opt) => {
                                                const isSelected = opt.id === userSelectedOptionId;
                                                const isTheCorrectOne = opt.isCorrect;

                                                let optionClass =
                                                    "p-3 rounded-md border flex justify-between items-center ";

                                                if (isSelected && isTheCorrectOne) {
                                                    optionClass +=
                                                        "bg-green-100 border-green-300 text-green-900 font-medium";
                                                } else if (isSelected && !isTheCorrectOne) {
                                                    optionClass +=
                                                        "bg-red-100 border-red-300 text-red-900 font-medium";
                                                } else if (!isSelected && isTheCorrectOne) {
                                                    optionClass +=
                                                        "bg-green-50 border-green-200 text-green-800 border-dashed";
                                                } else {
                                                    optionClass +=
                                                        "bg-white border-slate-100 text-slate-500 opacity-60";
                                                }

                                                return (
                                                    <div key={opt.id} className={optionClass}>
                                                        <span>{opt.optionText}</span>
                                                        {isSelected && (
                                                            <span className="text-xs font-bold">(Tu respuesta)</span>
                                                        )}
                                                        {!isSelected && isTheCorrectOne && (
                                                            <span className="text-xs">(Respuesta Correcta)</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                ) : (
                                    // Pregunta abierta (igual que ya la tenías)
                                    <div className="bg-slate-50 p-4 rounded-md italic text-slate-700">
                                        {userAnswer?.answerText || "Sin respuesta"}
                                    </div>
                                )}


                                {/* Valor en puntos (si no es opinión) */}
                                {q.score && !isOpinion && (
                                    <div className="text-xs text-right text-muted-foreground">
                                        Valor: {Number(q.score)} pts
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    )
}
