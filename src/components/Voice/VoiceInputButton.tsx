"use client";

import React, { useState } from "react";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAccessibility } from "@/context/AccessibilityContext";

export interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
  placeholderPrompt?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = "",
  size = "md",
  ariaLabel,
  placeholderPrompt,
}) => {
  const { language, t } = useAccessibility();
  const [showErrorToast, setShowErrorToast] = useState(false);

  const {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: language,
    onTranscript: (capturedText) => {
      onTranscript(capturedText);
    },
    onError: () => {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    },
  });

  const getLanguageLabel = () => {
    switch (language) {
      case "kn":
        return "ಕನ್ನಡ";
      case "hi":
        return "हिंदी";
      case "en":
      default:
        return "English";
    }
  };

  const getTooltipPrompt = () => {
    if (placeholderPrompt) return placeholderPrompt;
    if (isListening) return t.voice?.listening || "Listening... Click to stop";
    switch (language) {
      case "kn":
        return "ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ (ಕನ್ನಡ)";
      case "hi":
        return "बोलकर दर्ज करें (हिंदी)";
      case "en":
      default:
        return "Voice input (English)";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSupported) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else if (e.key === "Escape" && isListening) {
      e.preventDefault();
      stopListening();
    }
  };

  // Size styling
  const sizeClasses = {
    sm: "p-1.5 text-xs h-7 w-7",
    md: "p-2 text-sm h-9 w-9",
    lg: "p-2.5 text-base h-11 w-11",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <div className="relative inline-flex items-center">
      {/* Screen Reader Live Region for Accessibility Announcements */}
      <span className="sr-only" aria-live="polite" role="status">
        {isListening
          ? `${t.voice?.listening || "Listening in"} ${getLanguageLabel()}`
          : error
          ? `${t.accessibility?.status || "Status"}: ${error}`
          : ""}
      </span>

      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`relative flex items-center justify-center rounded-lg font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isListening
            ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-pulse ring-2 ring-rose-400"
            : "bg-gray-100 hover:bg-teal-50 dark:bg-gray-800 dark:hover:bg-teal-950/40 text-gray-700 dark:text-gray-200 hover:text-[#064E4A] dark:hover:text-teal-300 border border-gray-300 dark:border-gray-700"
        } ${sizeClasses} ${className}`}
        title={getTooltipPrompt()}
        aria-label={
          ariaLabel ||
          (isListening
            ? t.accessibility?.voiceInputStop || "Stop voice input"
            : t.accessibility?.voiceInputStart || "Start voice input")
        }
        aria-pressed={isListening}
      >
        {isListening ? (
          <>
            <MicOff className={`${iconSizes} animate-bounce`} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </>
        ) : (
          <Mic className={iconSizes} />
        )}
      </button>

      {/* Floating Listening Indicator Badge */}
      {isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-gray-900 text-white text-xs px-2.5 py-1 rounded-md shadow-xl flex items-center gap-1.5 border border-gray-700 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-semibold text-rose-300">
            {t.voice?.listening || "Listening..."}
          </span>
          <span className="text-gray-400 text-[10px] font-mono">
            [{getLanguageLabel()}]
          </span>
          {interimTranscript && (
            <span className="text-gray-300 max-w-[150px] truncate italic text-[11px]">
              &quot;{interimTranscript}&quot;
            </span>
          )}
        </div>
      )}

      {/* Floating Error Toast */}
      {showErrorToast && (
        <div
          role="alert"
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-rose-950 text-rose-200 text-xs px-3 py-1.5 rounded-md shadow-xl flex items-center gap-1.5 border border-rose-800"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>
            {error || (!isSupported ? t.voice?.notSupported || "Voice recognition not supported in this browser." : "Microphone error")}
          </span>
        </div>
      )}
    </div>
  );
};
