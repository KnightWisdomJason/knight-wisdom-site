"use client";
import { createContext, useContext, useState } from "react";
type Locale = "en" | "zh"; type Theme = "dark" | "light";
type Preferences = { locale: Locale; theme: Theme; setLocale: (locale: Locale) => void; setTheme: (theme: Theme) => void; t: (en: string, zh: string) => string };
const PreferencesContext = createContext<Preferences | null>(null);
export function PreferencesProvider({ children }: { children: React.ReactNode }) { const [locale, setLocale] = useState<Locale>("en"); const [theme, setTheme] = useState<Theme>("dark"); const t = (en: string, zh: string) => locale === "zh" ? zh : en; return <PreferencesContext.Provider value={{ locale, theme, setLocale, setTheme, t }}><div data-theme={theme}>{children}</div></PreferencesContext.Provider>; }
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw new Error("PreferencesProvider is required"); return value; }
