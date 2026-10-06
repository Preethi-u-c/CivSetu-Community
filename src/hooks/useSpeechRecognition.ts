"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Language } from "@/data/translations";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  lang?: Language;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string) => void;
  onError?: (errorMsg: string) => void;
}

export function useSpeechRecognition({
  lang = "en",
  continuous = false,
  interimResults = true,
  onTranscript,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Map application language to BCP 47 language tags
  const getBcp47Lang = (l: Language): string => {
    switch (l) {
      case "kn":
        return "kn-IN"; // Kannada (India)
      case "hi":
        return "hi-IN"; // Hindi (India)
      case "en":
      default:
        return "en-IN"; // English (India)
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as IWindow;
      const SpeechRecognitionClass =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        setIsSupported(true);
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = getBcp47Lang(lang);

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentInterim = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";
            if (result.isFinal) {
              finalTranscript += text + " ";
            } else {
              currentInterim += text;
            }
          }

          setInterimTranscript(currentInterim);

          if (finalTranscript.trim()) {
            const cleaned = finalTranscript.trim();
            setTranscript((prev) => (prev ? `${prev} ${cleaned}` : cleaned));
            if (onTranscript) {
              onTranscript(cleaned);
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          let message = "Speech recognition error";
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            message = "Microphone permission was denied. Please allow microphone access.";
          } else if (event.error === "no-speech") {
            message = "No voice detected. Please try speaking again.";
          } else if (event.error === "network") {
            message = "Network error occurred during speech recognition.";
          }
          setError(message);
          setIsListening(false);
          if (onError) onError(message);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [continuous, interimResults, lang]);

  // Update language dynamically if it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getBcp47Lang(lang);
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    setError(null);
    setInterimTranscript("");
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started, do nothing
      if (e?.name !== "InvalidStateError") {
        console.error("Error starting speech recognition:", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
