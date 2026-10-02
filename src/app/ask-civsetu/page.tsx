"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { useAuth } from "@/context/AuthContext";
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  HelpCircle,
  FileText,
  Briefcase,
  Landmark,
  CheckCircle2,
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

const POPULAR_QUERIES = [
  "How do I report a water problem?",
  "Where can I find municipal services?",
  "What documents are needed?",
  "What is the status of my complaint?",
  "Which department handles streetlights?",
  "ಕುಡಿಯುವ ನೀರಿನ ದೂರು ಹೇಗೆ ದಾಖಲಿಸುವುದು?",
  "What are the door-to-door garbage timings?",
  "How do I apply for an E-Swathu Khata extract?",
];

export default function AskCivSetuPage() {
  const { citizen } = useAuth();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: `Namaskara! I am CivSetu, your official AI Civic Assistant for Lakshmeshwar Town Municipal Council (TMC), Gadag District, Karnataka.

You can ask me anything about:
• How to file and track civic grievances (drinking water, streetlights, sanitation, potholes)
• Municipal certificates and Khata extract (Form-3) procedures
• Required documents and eligibility for government welfare schemes
• Department jurisdictions and statutory SLA resolution timelines

How may I assist you today?`,
      department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
      actions: [
        { label: "Report a Grievance", url: "/complaints/new" },
        { label: "Services Directory", url: "/services" },
        { label: "Track Case Status", url: "/track" },
        { label: "Welfare Schemes", url: "/schemes" },
      ],
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleAsk = async (textToSend?: string) => {
    const promptText = (textToSend || query).trim();
    if (!promptText || thinking) return;

    setMessages((prev) => [...prev, { sender: "user", text: promptText }]);
    setQuery("");
    setThinking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          citizenWard: citizen?.wardNumber,
        }),
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
            text: data.error || "I could not retrieve an answer at this moment. Please try again.",
            actions: [{ label: "Services Directory", url: "/services" }],
          },
        ]);
      }
    } catch (err) {
      console.error("Ask CivSetu error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "A connection issue occurred. Please check your network or browse our citizen directory manually.",
          actions: [{ label: "Lodge Complaint", url: "/complaints/new" }],
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <PageContainer
      title="Ask CivSetu AI"
      subtitle="Official Municipal Intelligence & Citizen Assistance Portal — Lakshmeshwar TMC"
      breadcrumbs={[{ label: "CivSetu AI" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Disclaimer Card */}
        <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl p-4 text-xs flex items-start gap-3 shadow-xs">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-xl text-[#064E4A] dark:text-teal-300 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 flex-1 text-gray-700 dark:text-gray-300">
            <p className="font-bold text-[#064E4A] dark:text-teal-300">
              Lakshmeshwar Municipal AI Civic Advisor
            </p>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              Guidance is grounded in the Karnataka Municipalities Act and the Lakshmeshwar TMC Citizen Charter. Official statutory determinations and field verifications take precedence.
            </p>
          </div>
        </div>

        {/* Chat Card */}
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 px-6 bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-teal-200 backdrop-blur-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>CivSetu Civic Assistant</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-teal-950 uppercase tracking-wider">
                    AI Enabled
                  </span>
                </h3>
                <p className="text-[11px] text-teal-100/90">
                  {citizen ? `Assisting ${citizen.fullName} • Ward: ${citizen.wardNumber}` : "Serving All 23 Wards of Lakshmeshwar TMC"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    sender: "bot",
                    text: "Conversation restarted. How can I assist you with Lakshmeshwar municipal services?",
                    department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
                    actions: [
                      { label: "Report a Grievance", url: "/complaints/new" },
                      { label: "Services Directory", url: "/services" },
                    ],
                  },
                ]);
              }}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl space-y-2.5 ${
                    m.sender === "user"
                      ? "bg-[#064E4A] text-white rounded-br-xs"
                      : "bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200 dark:border-gray-700 shadow-xs"
                  }`}
                >
                  {/* Department Badge */}
                  {m.department && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 pb-1 border-b border-gray-200 dark:border-gray-700/80">
                      <Building2 className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                      <span>{m.department}</span>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-line leading-relaxed text-xs sm:text-[13px]">
                    {m.text}
                  </div>

                  {/* Action Shortcuts */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {m.actions.map((act, aIdx) => (
                        <Link
                          key={aIdx}
                          href={act.url}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-gray-900 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 shadow-xs transition"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Footer Attribution */}
                  {m.sender === "bot" && (
                    <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-teal-600" />
                        <span>{m.provider || "CivSetu Municipal Intelligence"}</span>
                      </span>
                      <span>Citizen Charter</span>
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

          {/* Popular Queries Suggestions */}
          <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-gray-400 font-bold flex-shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Suggested:</span>
            </span>
            {POPULAR_QUERIES.map((sugg) => (
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

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="p-4 bg-white dark:bg-[#071d1b] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about water, streetlights, services, or paste complaint ID..."
              disabled={thinking}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#064E4A] dark:focus:border-teal-400"
            />
            <VoiceInputButton
              size="md"
              onTranscript={(spokenText) => {
                setQuery((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
              }}
              ariaLabel="Speak your municipal question in English, Kannada, or Hindi"
            />
            <button
              type="submit"
              disabled={!query.trim() || thinking}
              className="p-3 bg-[#064E4A] hover:bg-[#0B6B63] disabled:opacity-50 text-white rounded-xl shadow-xs transition flex-shrink-0"
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
    </PageContainer>
  );
}
