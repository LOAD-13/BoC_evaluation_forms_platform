export enum FormStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}

export enum AssignmentStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    EXPIRED = "EXPIRED"
}

export const STATUS_LABELS: Record<string, string> = {
    [FormStatus.DRAFT]: "Borrador",
    [FormStatus.PUBLISHED]: "Publicado",
    [FormStatus.ARCHIVED]: "Archivado",
    [AssignmentStatus.PENDING]: "Pendiente",
    [AssignmentStatus.IN_PROGRESS]: "En Progreso",
    [AssignmentStatus.COMPLETED]: "Finalizado",
    [AssignmentStatus.EXPIRED]: "Expirado"
};

export const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
    [FormStatus.DRAFT]: "secondary",
    [FormStatus.PUBLISHED]: "success",
    [FormStatus.ARCHIVED]: "outline",
    [AssignmentStatus.PENDING]: "default",
    [AssignmentStatus.IN_PROGRESS]: "default",
    [AssignmentStatus.COMPLETED]: "success",
    [AssignmentStatus.EXPIRED]: "destructive"
};
