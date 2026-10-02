"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { VoiceInputButton } from "@/components/Voice/VoiceInputButton";

interface ActionItem {
  label: string;
  url: string;
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  department?: string;
  actions?: ActionItem[];
  provider?: string;
  isRealAI?: boolean;
}

interface AskCivSetuModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizenWard?: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I report a water problem?",
  "Where can I find municipal services?",
  "What documents are needed?",
  "What is the status of my complaint?",
  "Which department handles streetlights?",
  "ಕುಡಿಯುವ ನೀರಿನ ದೂರು ಹೇಗೆ ದಾಖಲಿಸುವುದು?",
];

export const AskCivSetuModal: React.FC<AskCivSetuModalProps> = ({
  isOpen,
  onClose,
  citizenWard,
}) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: `Namaskara! I am CivSetu, your official AI Civic Assistant for Lakshmeshwar Town Municipal Council (TMC), Gadag District.

How can I help you today? You can ask me how to file grievances, find municipal services, check required documents, or inquire about departments.`,
      department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
      actions: [
        { label: "Report a Grievance", url: "/complaints/new" },
        { label: "Services Directory", url: "/services" },
        { label: "Track Case Status", url: "/track" },
      ],
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAsk = async (textToSend?: string) => {
    const promptText = (textToSend || query).trim();
    if (!promptText || thinking) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: promptText }]);
    setQuery("");
    setThinking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, citizenWard }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply,
            department: data.officialDepartment,
            actions: data.suggestedActions || [],
            provider: data.provider,
            isRealAI: data.isRealAI,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.error || "I could not retrieve an answer at this moment. Please try again or visit our Citizen Services directory.",
            actions: [{ label: "Services Directory", url: "/services" }],
          },
        ]);
      }
    } catch (err) {
      console.error("AI Chat invocation error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "A network issue occurred while connecting to the civic assistant. Please check your internet connection or use our manual grievance portal.",
          actions: [{ label: "Lodge Complaint", url: "/complaints/new" }],
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="civsetu-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col h-[600px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-5 bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-teal-200 backdrop-blur-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="civsetu-modal-title" className="font-bold text-sm">Ask CivSetu AI</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-teal-950 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Civic AI</span>
                </span>
              </div>
              <p className="text-[11px] text-teal-100/90">
                Lakshmeshwar TMC Municipal Assistance & Guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-teal-800 text-teal-200 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl space-y-2.5 ${
                  m.sender === "user"
                    ? "bg-[#064E4A] text-white rounded-br-xs"
                    : "bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200 dark:border-gray-700 shadow-xs"
                }`}
              >
                {/* Official Department Tag */}
                {m.department && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 pb-1 border-b border-gray-200 dark:border-gray-700/80">
                    <Building2 className="w-3 h-3 text-[#064E4A] dark:text-teal-400" />
                    <span>{m.department}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line leading-relaxed text-xs">
                  {m.text}
                </div>

                {/* Action Shortcuts */}
                {m.actions && m.actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {m.actions.map((act, aIdx) => (
                      <Link
                        key={aIdx}
                        href={act.url}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-gray-900 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 shadow-xs transition"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* AI / Grounding Attribution */}
                {m.sender === "bot" && (
                  <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-teal-600" />
                      <span>{m.provider || "CivSetu Municipal Engine"}</span>
                    </span>
                    <span>TMC Citizen Charter</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs w-fit border border-gray-200 dark:border-gray-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 animate-spin" />
              <span>CivSetu is consulting municipal rules...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Queries Carousel */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-gray-400 font-bold flex-shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Try:</span>
          </span>
          {SUGGESTED_QUESTIONS.map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => handleAsk(sugg)}
              disabled={thinking}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#064E4A] hover:text-[#064E4A] whitespace-nowrap transition text-[11px] disabled:opacity-50"
            >
              {sugg}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-3 bg-white dark:bg-[#071d1b] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about water, streetlights, services, or track ID (e.g. CMP-LMC-...)..."
            disabled={thinking}
            className="flex-1 px-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#064E4A] dark:focus:border-teal-400"
          />
          <VoiceInputButton
            size="sm"
            onTranscript={(spokenText) => {
              setQuery((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
            }}
            ariaLabel="Speak your question in English, Kannada, or Hindi"
          />
          <button
            type="submit"
            disabled={!query.trim() || thinking}
            className="p-2.5 bg-[#064E4A] hover:bg-[#0B6B63] disabled:opacity-50 text-white rounded-xl shadow-xs transition flex-shrink-0"
            title="Send query"
          >
            {thinking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
