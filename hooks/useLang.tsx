"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations } from "@/lib/i18n";

interface LangContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations.en;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && ["en", "uz", "ru"].includes(saved)) setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  };

  return (
    <LangContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
