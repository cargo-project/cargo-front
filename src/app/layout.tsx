import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/auth/AuthContext";
export const metadata: Metadata = { title: "CarGO | Gestión de flota", description: "Monitoreo inteligente de vehículos de carga pesada" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body><LanguageProvider><AuthProvider><AppLayout>{children}</AppLayout></AuthProvider></LanguageProvider></body></html>; }
