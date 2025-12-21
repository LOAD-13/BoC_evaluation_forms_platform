import { prisma } from "@/lib/db/prisma";

interface EvaluatedResponse {
    score: number;
    maxScore: number;
    passed: boolean;
    details: any[];
}

export const scoringService = {
    async calculateScore(formId: string, answers: Record<string, string>): Promise<EvaluatedResponse> {
        // 1. Obtener el formulario con las respuestas correctas
        // Importante: No confiamos en lo que envía el cliente, consultamos la DB.
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });

        if (!form) throw new Error("Formulario no encontrado");

        let totalScore = 0;
        let maxScore = 0;
        const detailsToSave = [];

        // 2. Recorrer preguntas y calificar
        for (const question of form.questions) {
            const userAnswerId = answers[question.id];

            // Sumar al puntaje máximo posible del examen
            // Si el score es null, asumimos 0 puntos (informativa/texto)
            const questionPoints = question.score ? Number(question.score) : 0;
            maxScore += questionPoints;

            let isCorrect = false;
            let selectedOptionId = null;
            let answerText = null;

            if (question.questionType === 'multiple' || question.questionType === 'true_false') {
                // Verificar si la respuesta es una de las opciones
                const selectedOption = question.options.find(opt => opt.id === userAnswerId);

                if (selectedOption) {
                    selectedOptionId = selectedOption.id;
                    isCorrect = selectedOption.isCorrect;
                } else if (question.questionType === 'true_false') {
                    // Caso especial si true_false no usó opciones en DB (MVP simple)
                    // Pero mi implementación de QuestionBuilder guarda opciones, así que debería caer en el if anterior.
                }

            } else {
                // Preguntas de texto: Por ahora requerirían calificación manual o IA.
                // Asumimos correctas o 0 puntos en este MVP automático.
                answerText = userAnswerId;
                // isCorrect = ??? (Pendiente para V2)
            }

            if (isCorrect) {
                totalScore += questionPoints;
            }

            detailsToSave.push({
                questionId: question.id,
                selectedOptionId,
                answerText
            });
        }

        // 3. Determinar aprobado/reprobado (Ejemplo: > 60%)
        // Esto podría configurarse en el Form en el futuro.
        const passingScore = maxScore * 0.6;
        const passed = totalScore >= passingScore;

        return {
            score: totalScore,
            maxScore,
            passed,
            details: detailsToSave
        };
    }
};
