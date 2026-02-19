import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RADECO CRM - Gestión de Clientes y Ventas",
  description: "Sistema CRM premium para RADECO - Implementos agrícolas, repuestos y maquinaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
