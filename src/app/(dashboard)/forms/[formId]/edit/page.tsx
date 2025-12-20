import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import FormEditor from "../../_components/FormEditor";

interface EditFormPageProps {
    params: Promise<{ formId: string }>;
}

export default async function EditFormPage({ params }: EditFormPageProps) {
    const { formId } = await params;

    // Obtenemos los datos iniciales directamente de la BD (Server Side)
    const form = await prisma.form.findUnique({
        where: { id: formId },
        include: {
            questions: {
                orderBy: { id: 'asc' },  // Cambia de createdAt a id
                include: {
                    options: {
                        orderBy: { id: 'asc' }
                    }
                }
            }
        }
    });


    if (!form) {
        notFound();
    }

    // Serializamos las fechas para evitar warnings de Next.js al pasar objetos a Client Components
    const serializedForm = {
        ...form,
        createdAt: form.createdAt.toISOString(),
        // @ts-ignore: Si existe updated_at
        updatedAt: form.updatedAt?.toISOString() || new Date().toISOString(),
        questions: form.questions.map(q => ({
            ...q,
            score: Number(q.score), // Asegurar que sea número (Prisma devuelve Decimal a veces)
            options: q.options || []
        }))
    };

    return (
        <div className="h-full flex flex-col">
            <FormEditor initialData={serializedForm} />
        </div>
    );
}