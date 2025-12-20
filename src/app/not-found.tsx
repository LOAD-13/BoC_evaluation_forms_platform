import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <h2 className="text-4xl font-bold text-primary">404</h2>
            <p className="mt-2 text-xl text-muted-foreground">Página no encontrada</p>
            <p className="mb-8 mt-2 text-muted-foreground">
                Lo sentimos, no pudimos encontrar el recurso que estabas buscando.
            </p>
            <Link
                href="/"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                Volver al inicio
            </Link>
        </div>
    );
}