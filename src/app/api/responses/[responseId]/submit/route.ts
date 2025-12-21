import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { scoringService } from "@/features/evaluations/services/scoringService";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ responseId: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { answers } = body;
        const { responseId } = params;

        if (!answers) {
            return NextResponse.json({ error: "No answers provided" }, { status: 400 });
        }

        // 1. Obtener Response para saber el formId
        const response = await prisma.response.findUnique({
            where: { id: responseId }
        });

        if (!response) {
            return NextResponse.json({ error: "Response not found" }, { status: 404 });
        }

        if (response.finishedAt) {
            return NextResponse.json({ error: "Evaluation already finished" }, { status: 400 });
        }

        // 2. Calcular puntaje
        const result = await scoringService.calculateScore(response.formId, answers);

        // 3. Guardar resultados en transacción
        await prisma.$transaction(async (tx) => {
            // Guardar detalles de cada respuesta
            if (result.details.length > 0) {
                await tx.responseDetail.createMany({
                    data: result.details.map((d) => ({
                        responseId,
                        questionId: d.questionId,
                        selectedOptionId: d.selectedOptionId,
                        answerText: d.answerText,
                    }))
                });
            }

            // Guardar evaluación final
            await tx.evaluation.create({
                data: {
                    responseId,
                    totalScore: result.score,
                    maxScore: result.maxScore,
                    passed: result.passed,
                }
            });

            // Marcar respuesta como finalizada
            await tx.response.update({
                where: { id: responseId },
                data: { finishedAt: new Date() }
            });

            // Opcional: Si tuviéramos tabla Score separada (el schema lo tiene)
            // await tx.score.create(...) // Si hubiera userId vinculado
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error submitting response:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
