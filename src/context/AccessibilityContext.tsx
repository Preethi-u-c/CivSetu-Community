"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Language,
  translations,
  TranslationDictionary,
} from "@/data/translations";

type TextSize = "sm" | "normal" | "lg";
type Theme = "light" | "dark";

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  resetTextSize: () => void;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  screenReaderActive: boolean;
  toggleScreenReader: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [screenReaderActive, setScreenReaderActive] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const applyTextSize = (size: TextSize) => {
    const root = document.documentElement;

    root.classList.remove(
      "text-scale-sm",
      "text-scale-normal",
      "text-scale-lg"
    );

    root.classList.add(`text-scale-${size}`);
  };

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("civsetu-theme") as Theme) || "light";
    const savedSize =
      (localStorage.getItem("civsetu-text-size") as TextSize) || "normal";
    const savedLang =
      (localStorage.getItem("civsetu-lang") as Language) || "en";

    setTheme(savedTheme);
    setTextSize(savedSize);
    setLanguage(savedLang);

    applyTheme(savedTheme);
    applyTextSize(savedSize);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("civsetu-theme", nextTheme);
  };

  const handleSetTextSize = (size: TextSize) => {
    setTextSize(size);
    applyTextSize(size);
    localStorage.setItem("civsetu-text-size", size);
  };

  const increaseTextSize = () => {
    if (textSize === "sm") {
      handleSetTextSize("normal");
    } else if (textSize === "normal") {
      handleSetTextSize("lg");
    }
  };

  const decreaseTextSize = () => {
    if (textSize === "lg") {
      handleSetTextSize("normal");
    } else if (textSize === "normal") {
      handleSetTextSize("sm");
    }
  };

  const resetTextSize = () => {
    handleSetTextSize("normal");
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("civsetu-lang", lang);
  };

  const toggleScreenReader = () => {
    setScreenReaderActive((prev) => !prev);
  };

  const t = translations[language] || translations.en;

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize: handleSetTextSize,
        increaseTextSize,
        decreaseTextSize,
        resetTextSize,
        theme,
        toggleTheme,
        language,
        setLanguage: handleSetLanguage,
        t,
        screenReaderActive,
        toggleScreenReader,
      }}
    >
      <div
        className={screenReaderActive ? "screen-reader-optimized" : ""}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }

  return context;
}