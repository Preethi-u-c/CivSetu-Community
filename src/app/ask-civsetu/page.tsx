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
import { useAccessibility } from "@/context/AccessibilityContext";

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

export default function AskCivSetuPage() {
  const { language } = useAccessibility();
  const { citizen } = useAuth();
  const [query, setQuery] = useState("");

  const popularQueries = language === "kn" ? [
    "ಕುಡಿಯುವ ನೀರಿನ ಸಮಸ್ಯೆ ಹೇಗೆ ವರದಿ ಮಾಡುವುದು?",
    "ಪುರಸಭೆಯ ಸೇವೆಗಳು ಎಲ್ಲಿ ಸಿಗುತ್ತವೆ?",
    "ಯಾವ ದಾಖಲೆಗಳು ಬೇಕಾಗುತ್ತವೆ?",
    "ನನ್ನ ದೂರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಹೇಗೆ?",
    "ಬೀದಿದೀಪಗಳ ಸಮಸ್ಯೆಯನ್ನು ಯಾವ ವಿಭಾಗ ನಿರ್ವಹಿಸುತ್ತದೆ?",
    "ಕಸ ಸಂಗ್ರಹಣೆಯ ವೇಳಾಪಟ್ಟಿ ಯಾವುದು?",
    "ಇ-ಸ್ವತ್ತು ಖಾತಾ ನಕಲಿಗೆ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು?",
  ] : language === "hi" ? [
    "पेयजल समस्या की शिकायत कैसे करें?",
    "नगर पालिका सेवाएं कहां मिलेंगी?",
    "कौन से दस्तावेज आवश्यक हैं?",
    "मेरी शिकायत की स्थिति क्या है?",
    "स्ट्रीट लाइट का कार्य कौन सा विभाग देखता है?",
    "घर-घर कचरा संग्रहण का समय क्या है?",
    "ई-स्वथु खाता प्रति हेतु आवेदन कैसे करें?",
  ] : [
    "How do I report a water problem?",
    "Where can I find municipal services?",
    "What documents are needed?",
    "What is the status of my complaint?",
    "Which department handles streetlights?",
    "ಕುಡಿಯುವ ನೀರಿನ ದೂರು ಹೇಗೆ ದಾಖಲಿಸುವುದು?",
    "What are the door-to-door garbage timings?",
    "How do I apply for an E-Swathu Khata extract?",
  ];

  const initialBotMessage: ChatMessage = {
    sender: "bot",
    text: language === "kn"
      ? `ನಮಸ್ಕಾರ! ನಾನು ಸಿವಿಸೇತು, ಕರ್ನಾಟಕದ ಗದಗ ಜಿಲ್ಲೆಯ ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ (ಟಿಎಂಸಿ) ಅಧಿಕೃತ AI ನಾಗರಿಕ ಸಹಾಯಕ.

ನೀವು ಈ ಕೆಳಗಿನವುಗಳ ಕುರಿತು ನನ್ನನ್ನು ಕೇಳಬಹುದು:
• ನಾಗರಿಕ ದೂರುಗಳನ್ನು ದಾಖಲಿಸುವುದು ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು (ಕುಡಿಯುವ ನೀರು, ಬೀದಿದೀಪ, ಚರಂಡಿ, ರಸ್ತೆ ಗುಂಡಿಗಳು)
• ಪುರಸಭೆಯ ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ಇ-ಸ್ವತ್ತು ಖಾತಾ (ಫಾರ್ಮ್-3) ಪ್ರಕ್ರಿಯೆಗಳು
• ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಅರ್ಹತೆ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳು
• ಇಲಾಖಾ ವ್ಯಾಪ್ತಿ ಮತ್ತು ಶಾಸನಬದ್ಧ ಎಸ್‌ಎಲ್‌ಎ ಪರಿಹಾರ ಕಾಲಮಿತಿಗಳು

ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`
      : language === "hi"
      ? `नमस्कार! मैं सिविसेतु हूँ, गदग जिला, कर्नाटक की लक्ष्मेश्वर नगर पालिका परिषद (TMC) का आधिकारिक AI नागरिक सहायक।

आप मुझसे इन विषयों पर जानकारी प्राप्त कर सकते हैं:
• नागरिक शिकायतें दर्ज करना एवं ट्रैक करना (पेयजल, स्ट्रीट लाइट, स्वच्छता, गड्ढे)
• नगर पालिका प्रमाण पत्र एवं ई-स्वथु खाता (फॉर्म-3) प्रक्रियाएं
• सरकारी कल्याणकारी योजनाओं हेतु पात्रता एवं आवश्यक दस्तावेज
• विभाग के अधिकार क्षेत्र एवं वैधानिक समाधान समय-सीमा

आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?`
      : `Namaskara! I am CivSetu, your official AI Civic Assistant for Lakshmeshwar Town Municipal Council (TMC), Gadag District, Karnataka.

You can ask me anything about:
• How to file and track civic grievances (drinking water, streetlights, sanitation, potholes)
• Municipal certificates and Khata extract (Form-3) procedures
• Required documents and eligibility for government welfare schemes
• Department jurisdictions and statutory SLA resolution timelines

How may I assist you today?`,
    department: language === "kn" ? "ನಾಗರಿಕ ಸೇವಾ ಕೇಂದ್ರ (CFC), ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ" : language === "hi" ? "नागरिक सुविधा केंद्र (CFC), लक्ष्मेश्वर नगर पालिका" : "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
    actions: [
      { label: language === "kn" ? "ದೂರು ಸಲ್ಲಿಸಿ" : language === "hi" ? "शिकायत दर्ज करें" : "Report a Grievance", url: "/complaints/new" },
      { label: language === "kn" ? "ಸೇವೆಗಳ ಡೈರೆಕ್ಟರಿ" : language === "hi" ? "सेवाएं डायरेक्टरी" : "Services Directory", url: "/services" },
      { label: language === "kn" ? "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ" : language === "hi" ? "स्थिति जांचें" : "Track Case Status", url: "/track" },
      { label: language === "kn" ? "ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು" : language === "hi" ? "कल्याण योजनाएं" : "Welfare Schemes", url: "/schemes" },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialBotMessage]);

  useEffect(() => {
    setMessages([initialBotMessage]);
  }, [language]);
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
      title={
        language === "kn"
          ? "ಸಿವಿಸೇತು AI ಸಹಾಯವಾಣಿ"
          : language === "hi"
          ? "सिवಿसेतु AI नागरिक सहायक"
          : "Ask CivSetu AI"
      }
      subtitle={
        language === "kn"
          ? "ಅಧಿಕೃತ ಪುರಸಭೆ ಮಾಹಿತಿ ಹಾಗೂ ನಾಗರಿಕ ನೆರವು ಪೋರ್ಟಲ್ — ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ"
          : language === "hi"
          ? "आधिकारिक नगर पालिका बुद्धिमत्ता एवं नागरिक सहायता पोर्टल — लक्ष्मेश्वर नगर पालिका"
          : "Official Municipal Intelligence & Citizen Assistance Portal — Lakshmeshwar TMC"
      }
      breadcrumbs={[{ label: language === "kn" ? "ಸಿವಿಸೇತು AI" : language === "hi" ? "सिवಿसेतु AI" : "CivSetu AI" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Disclaimer Card */}
        <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl p-4 text-xs flex items-start gap-3 shadow-xs">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-xl text-[#064E4A] dark:text-teal-300 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 flex-1 text-gray-700 dark:text-gray-300">
            <p className="font-bold text-[#064E4A] dark:text-teal-300">
              {language === "kn"
                ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ AI ನಾಗರಿಕ ಸಲಹೆಗಾರ"
                : language === "hi"
                ? "लक्ष्मेश्वर नगर पालिका AI नागरिक सलाहकार"
                : "Lakshmeshwar Municipal AI Civic Advisor"}
            </p>
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
              {language === "kn"
                ? "ಮಾರ್ಗದರ್ಶನವು ಕರ್ನಾಟಕ ಪೌರಸಭೆಗಳ ಕಾಯ್ದೆ ಮತ್ತು ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಸಿಟಿಜನ್ ಚಾರ್ಟರ್ ಅನ್ನು ಆಧರಿಸಿದೆ. ಅಧಿಕೃತ ಶಾಸನಬದ್ಧ ನಿರ್ಣಯಗಳು ಮತ್ತು ಸ್ಥಳ ಪರಿಶೀಲನೆಗಳು ಅಂತಿಮವಾಗಿರುತ್ತವೆ."
                : language === "hi"
                ? "यह मार्गदर्शन कर्नाटक नगर पालिका अधिनियम एवं लक्ष्मेश्वर TMC नागरिक चार्टर पर आधारित है। आधिकारिक वैधानिक निर्णय एवं स्थल सत्यापन मान्य होंगे।"
                : "Guidance is grounded in the Karnataka Municipalities Act and the Lakshmeshwar TMC Citizen Charter. Official statutory determinations and field verifications take precedence."}
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
                  <span>{language === "kn" ? "ಸಿವಿಸೇತು AI ಸಹಾಯಕ" : language === "hi" ? "सिवಿसेतु नागरिक सहायक" : "CivSetu Civic Assistant"}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-teal-950 uppercase tracking-wider">
                    {language === "kn" ? "AI ಸಶಕ್ತ" : language === "hi" ? "AI सक्षम" : "AI Enabled"}
                  </span>
                </h3>
                <p className="text-[11px] text-teal-100/90">
                  {citizen
                    ? `${citizen.fullName} • ${language === "kn" ? "ವಾರ್ಡ್" : language === "hi" ? "वार्ड" : "Ward"}: ${citizen.wardNumber}`
                    : language === "kn" ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಎಲ್ಲಾ 23 ವಾರ್ಡ್‌ಗಳ ಸೇವೆಗೆ ಲಭ್ಯ" : language === "hi" ? "लक्ष्मेश्वर TMC के सभी 23 वार्डों की सेवा में" : "Serving All 23 Wards of Lakshmeshwar TMC"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([initialBotMessage]);
              }}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === "kn" ? "ಮರುಹೊಂದಿಸಿ" : language === "hi" ? "रीसेट" : "Reset"}</span>
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
                      <span>{language === "kn" ? "ನಾಗರಿಕ ಸನ್ನದು" : language === "hi" ? "नागरिक चार्टर" : "Citizen Charter"}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs w-fit border border-gray-200 dark:border-gray-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 animate-spin" />
                <span>{language === "kn" ? "ಸಿವಿಸೇತು ಪುರಸಭೆಯ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ..." : language === "hi" ? "सिविसेतु नगर पालिका नियमों का सत्यापन कर रहा है..." : "CivSetu is consulting municipal rules..."}</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Popular Queries Suggestions */}
          <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-gray-400 font-bold flex-shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>{language === "kn" ? "ಸೂಚಿತ ಪ್ರಶ್ನೆಗಳು:" : language === "hi" ? "सुझावित प्रश्न:" : "Suggested:"}</span>
            </span>
            {popularQueries.map((sugg) => (
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
              placeholder={
                language === "kn"
                  ? "ಕುಡಿಯುವ ನೀರು, ಬೀದಿದೀಪ, ಸೇವೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ ಅಥವಾ ದೂರು ಸಂಖ್ಯೆ ನಮೂದಿಸಿ..."
                  : language === "hi"
                  ? "पानी, स्ट्रीट लाइट, सेवाओं के बारे में पूछें या शिकायत संख्या दर्ज करें..."
                  : "Ask about water, streetlights, services, or paste complaint ID..."
              }
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
