export default function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground">Panel de Administración</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    AD
                </div>
            </div>
        </header>
    );
}