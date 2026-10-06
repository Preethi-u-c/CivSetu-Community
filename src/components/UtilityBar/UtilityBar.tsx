"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Sun, Moon, Volume2 } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { siteConfig } from "@/data/siteConfig";

export const UtilityBar: React.FC = () => {
  const {
    textSize,
    decreaseTextSize,
    resetTextSize,
    increaseTextSize,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    screenReaderActive,
    toggleScreenReader,
  } = useAccessibility();

  return (
    <header className="bg-[#111827] dark:bg-[#031514] text-gray-200 text-[12px] border-b border-gray-800 transition-colors">
      <div className="max-w-[1380px] mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-y-2">
        {/* Left Side: Login | PIGRS | WhatsApp | Socials */}
        <div className="flex items-center flex-wrap gap-2 text-gray-300">
          <Link
            href="/login"
            className="hover:text-amber-400 font-medium transition-colors"
          >
            {t.topBar.login}
          </Link>
          <span className="text-gray-500">/</span>
          <Link
            href="/register"
            className="hover:text-amber-400 font-medium transition-colors"
          >
            {t.topBar.register || "Register"}
          </Link>
          <span className="text-gray-500">|</span>

          <a
            href={`tel:${siteConfig.pigrsNumber}`}
            className="hover:text-amber-400 transition-colors"
            title="Public Information Grievance Redressal System"
          >
            {t.topBar.pigrs}
          </a>
          <span className="text-gray-500">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-300">{t.topBar.whatsapp}</span>
            <span className="text-gray-500">|</span>
            <a
              href={siteConfig.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 p-0.5 rounded transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a
              href={siteConfig.socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 p-0.5 rounded transition-colors"
              aria-label="Twitter / X"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 p-0.5 rounded transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Side: Skip to content | Screen Reader | Languages | Font Resizing | Theme */}
        <div className="flex items-center flex-wrap gap-2 text-gray-300">
          <a
            href="#main-content"
            className="skip-link hover:text-amber-400 underline underline-offset-2 transition-colors"
          >
            {t.topBar.skipToMain}
          </a>
          <span className="text-gray-500">|</span>

          <button
            onClick={toggleScreenReader}
            className={`flex items-center gap-1 hover:text-amber-400 transition-colors ${
              screenReaderActive ? "text-amber-400 font-semibold" : ""
            }`}
            title="Toggle Screen Reader Mode"
            aria-pressed={screenReaderActive}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t.topBar.screenReader}</span>
          </button>
          <span className="text-gray-500">|</span>

          {/* Language Switcher: English | ಕನ್ನಡ | हिंदी */}
          <div className="flex items-center gap-1.5" role="region" aria-label={t.accessibility?.languageSelect || "Language Select"}>
            <button
              onClick={() => setLanguage("en")}
              className={`hover:text-amber-400 transition-colors ${
                language === "en" ? "text-amber-400 font-bold underline" : "text-gray-300"
              }`}
              aria-label="English Language"
              aria-pressed={language === "en"}
            >
              English
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() => setLanguage("kn")}
              className={`hover:text-amber-400 transition-colors font-kannada ${
                language === "kn" ? "text-amber-400 font-bold underline" : "text-gray-300"
              }`}
              aria-label="ಕನ್ನಡ ಭಾಷೆ (Kannada Language)"
              aria-pressed={language === "kn"}
            >
              ಕನ್ನಡ
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() => setLanguage("hi")}
              className={`hover:text-amber-400 transition-colors font-hindi ${
                language === "hi" ? "text-amber-400 font-bold underline" : "text-gray-300"
              }`}
              aria-label="हिंदी भाषा (Hindi Language)"
              aria-pressed={language === "hi"}
            >
              हिंदी
            </button>
          </div>
          <span className="text-gray-500">|</span>

          {/* Font Resizing Controls A- A A+ */}
          <div className="flex items-center gap-1 bg-gray-800/80 px-1.5 py-0.5 rounded border border-gray-700">
            <button
              onClick={decreaseTextSize}
              className={`px-1 rounded text-[11px] hover:bg-gray-700 transition ${
                textSize === "sm" ? "bg-amber-500 text-gray-950 font-bold" : ""
              }`}
              aria-label="Decrease text size"
              title="Decrease text size (A-)"
            >
              A-
            </button>
            <button
              onClick={resetTextSize}
              className={`px-1 rounded text-[11px] hover:bg-gray-700 transition ${
                textSize === "normal" ? "bg-amber-500 text-gray-950 font-bold" : ""
              }`}
              aria-label="Normal text size"
              title="Standard text size (A)"
            >
              A
            </button>
            <button
              onClick={increaseTextSize}
              className={`px-1 rounded text-[11px] hover:bg-gray-700 transition ${
                textSize === "lg" ? "bg-amber-500 text-gray-950 font-bold" : ""
              }`}
              aria-label="Increase text size"
              title="Increase text size (A+)"
            >
              A+
            </button>
          </div>

          {/* Theme Toggle Moon / Sun */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-amber-300 transition"
            aria-label={t.topBar.toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
