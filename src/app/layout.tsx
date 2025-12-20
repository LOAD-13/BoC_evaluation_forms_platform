import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

// Configuración de la fuente Inter (Google Fonts)
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: {
        template: "%s | Plataforma de Evaluaciones",
        default: "Plataforma de Evaluaciones",
    },
    description: "Sistema de gestión de exámenes y encuestas de capacitación.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
                <main className="relative flex min-h-screen flex-col">
                    {children}
                </main>
                <Toaster />
            </body>
        </html>
    );
}