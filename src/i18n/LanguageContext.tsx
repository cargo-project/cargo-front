"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { es, type TranslationKey } from "@/locales/es";
import { en } from "@/locales/en";

export type Language = "es" | "en";
interface LanguageContextValue { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string; }
const LanguageContext = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  useEffect(() => { const saved = localStorage.getItem("cargo-language"); if (saved === "en" || saved === "es") setLanguageState(saved); }, []);
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("cargo-language", next); document.documentElement.lang = next; };
  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => (language === "es" ? es : en)[key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const context = useContext(LanguageContext); if (!context) throw new Error("useLanguage must be used inside LanguageProvider"); return context; }
