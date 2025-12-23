import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

// [MODIFICADO] Títulos actualizados
export const metadata: Metadata = {
    title: {
        template: "%s | BoCForms",
        default: "BoCForms - Plataforma de Evaluaciones",
    },
    description: "Sistema de gestión de exámenes y encuestas del Bank of China.",
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