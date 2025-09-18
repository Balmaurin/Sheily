import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Sheily AI — People‑powered AI",
  description: "Sistema de inteligencia artificial avanzado con chat en tiempo real y entrenamiento personalizado.",
  metadataBase: new URL("http://localhost:3000"),
  keywords: ["AI", "Chat", "Machine Learning", "Llama-3.2-3B-Instruct-Q8_0", "Sheily"],
  authors: [{ name: "Sheily AI Team" }],
  robots: "index, follow"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <AuthProvider>
          <div suppressHydrationWarning>
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
