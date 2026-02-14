import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "fr" | "ar";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  locale: string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    const direction = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      locale: language === "ar" ? "ar-MA" : "fr-FR"
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
