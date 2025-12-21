import { FormStatus } from "@/lib/constants/statusTypes";

export interface Form {
    id: string;
    title: string;
    description?: string | null;
    status: FormStatus; // Usamos el Enum
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    // Agrega más campos según necesites mapear desde Prisma
    _count?: {
        responses: number;
    };
    // Campos extendidos para el UI
    isPublished?: boolean;
    publicToken?: string;
    hasResponse?: boolean;
    userEvaluation?: any; // Tipar mejor si es posible
}
