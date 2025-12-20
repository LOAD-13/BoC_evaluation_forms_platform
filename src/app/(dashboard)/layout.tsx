import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20">
            {/* Sidebar fijo a la izquierda */}
            <Sidebar />

            {/* Contenido principal a la derecha */}
            <div className="md:ml-64 flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}