"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  Building,
  ArrowLeft,
  Share2,
  CheckCircle,
  ExternalLink,
  Users,
  AlertCircle,
  Ticket,
  Sparkles,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import { MunicipalEvent, DEFAULT_EVENT_IMAGE } from "@/lib/types/events";
import { useAccessibility } from "@/context/AccessibilityContext";
import { EVENTS_TRANSLATIONS, EVENT_CATEGORY_MAP } from "@/data/eventTranslations";

export default function EventDetailPage() {
  const { language } = useAccessibility();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<MunicipalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      setLoading(false);
      try {
        const res = await fetch(`/api/events/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setEvent(json.data);
        } else {
          setError(json.error || "Event not found or no longer active.");
        }
      } catch (err) {
        console.error("Failed to load event:", err);
        setError("Failed to connect to event database.");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Retrieving event particulars...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Event Not Available</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{error || "The requested event could not be found."}</p>
        <div className="pt-2">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Events Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPast = new Date(event.eventDate) < new Date(new Date().toDateString());
  const loc = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN";
  const eventDateFormatted = new Date(event.eventDate).toLocaleDateString(loc, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const localized = language === "kn" 
    ? EVENTS_TRANSLATIONS[event.id]?.kn 
    : language === "hi" 
    ? EVENTS_TRANSLATIONS[event.id]?.hi 
    : null;

  const displayTitle = localized?.title || event.title;
  const displayDesc = localized?.description || event.description;
  const displayLocation = localized?.location || event.location;
  const displayOrganizer = localized?.organizer || event.organizer;
  const displayCategory = localized?.category || (EVENT_CATEGORY_MAP[event.category]?.[language as "kn" | "hi"] || event.category);

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-400 hover:text-teal-950 dark:hover:text-teal-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "kn" ? "ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಹಿಂತಿರುಗಿ" : language === "hi" ? "सभी कार्यक्रमों पर वापस जाएं" : "Back to All Events"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>
              {copied
                ? language === "kn"
                  ? "ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!"
                  : language === "hi"
                  ? "लिंक कॉपी हो गया!"
                  : "Link Copied!"
                : language === "kn"
                ? "ಕಾರ್ಯಕ್ರಮ ಹಂಚಿಕೊಳ್ಳಿ"
                : language === "hi"
                ? "कार्यक्रम साझा करें"
                : "Share Event"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-96 w-full bg-gray-900">
          <Image
            src={event.imageUrl || DEFAULT_EVENT_IMAGE}
            alt={displayTitle}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-[#064E4A] text-white text-xs font-bold rounded-full shadow">
              {displayCategory}
            </span>
            <span className="px-3 py-1 bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white text-xs font-semibold rounded-full shadow backdrop-blur-sm">
              {event.wardRelevance}
            </span>
            {isPast ? (
              <span className="px-3 py-1 bg-gray-700 text-white text-xs font-semibold rounded-full shadow">
                {language === "kn" ? "ಹಿಂದಿನ ಕಾರ್ಯಕ್ರಮ" : language === "hi" ? "पुराना कार्यक्रम" : "Archived Event"}
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow animate-pulse">
                {language === "kn" ? "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮ" : language === "hi" ? "आगामी कार्यक्रम" : "Upcoming"}
              </span>
            )}
          </div>

          {/* Hero Bottom Title */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              {displayTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-teal-100">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-300" />
                {eventDateFormatted}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-300" />
                {event.startTime} {event.endTime ? `– ${event.endTime}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-300" />
                {displayLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body & Sidebar */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                {language === "kn" ? "ಕಾರ್ಯಕ್ರಮದ ವಿವರ / ಪರಿಚಯ" : language === "hi" ? "इस कार्यक्रम के बारे में" : "About this Event / Program"}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {displayDesc}
              </p>
            </div>

            {/* Special Instructions or Municipal Note */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#064E4A] dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-teal-950 dark:text-teal-200">
                <strong className="font-bold">
                  {language === "kn" ? "ನಾಗರಿಕರ ಹಾಜರಾತಿ ಸೂಚನೆ:" : language === "hi" ? "नागरिक उपस्थिति सूचना:" : "Citizen Attendance Advisory:"}
                </strong>
                <p>
                  {language === "kn"
                    ? "ಭಾಗವಹಿಸುವವರು ನಿಗದಿತ ಸಮಯಕ್ಕಿಂತ 15 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ತಲುಪಲು ಕೋರಲಾಗಿದೆ. ಆಸನ ವ್ಯವಸ್ಥೆ ಮತ್ತು ವಿಶೇಷ ಸೌಲಭ್ಯಗಳನ್ನು ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಆಡಳಿತವು ವಹಿಸಿಕೊಂಡಿದೆ."
                    : language === "hi"
                    ? "उपस्थित लोगों से अनुरोध है कि वे निर्धारित समय से 15 मिनट पूर्व पहुंचें। बैठक व्यवस्था एवं सुविधाएं लक्ष्मेश्वर नगर पालिका द्वारा प्रदान की जाएंगी।"
                    : "Attendees are requested to arrive 15 minutes prior to scheduled start time. Seating arrangements and accessibility provisions are overseen by the Lakshmeshwar Town Municipal Council administration."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Particulars Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                {language === "kn" ? "ಕಾರ್ಯಕ್ರಮದ ಮುಖ್ಯಾಂಶಗಳು" : language === "hi" ? "कार्यक्रम का विवरण" : "Event Particulars"}
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    {language === "kn" ? "ಆಯೋಜಕ ಸಂಸ್ಥೆ" : language === "hi" ? "आयोजक संस्था" : "Organizing Body"}
                  </span>
                  <strong className="text-gray-900 dark:text-gray-100 font-semibold">{displayOrganizer}</strong>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    {language === "kn" ? "ಸ್ಥಳ ಮತ್ತು ವಿಳಾಸ" : language === "hi" ? "स्थान एवं पता" : "Venue & Location"}
                  </span>
                  <strong className="text-gray-900 dark:text-gray-100 font-semibold">{displayLocation}</strong>
                  <span className="block text-[11px] text-gray-500 mt-0.5">{event.wardRelevance}</span>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    {language === "kn" ? "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ" : language === "hi" ? "दिनांक और समय" : "Date & Time"}
                  </span>
                  <strong className="text-gray-900 dark:text-gray-100 font-semibold">
                    {eventDateFormatted}
                  </strong>
                  <span className="block text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    {event.startTime} {event.endTime ? `– ${event.endTime}` : ""}
                  </span>
                </div>

                {event.capacity && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-xs">
                      {language === "kn" ? "ಸ್ಥಳ ಸಾಮರ್ಥ್ಯ" : language === "hi" ? "स्थान क्षमता" : "Venue Capacity"}
                    </span>
                    <strong className="text-gray-900 dark:text-gray-100 font-semibold">
                      {event.capacity} {language === "kn" ? "ನಾಗರಿಕರು" : language === "hi" ? "नागरिक" : "Citizens"}
                    </strong>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    {language === "kn" ? "ಪ್ರವೇಶ ಮತ್ತು ನೋಂದಣಿ" : language === "hi" ? "प्रवेश एवं पंजीकरण" : "Entry & Admission"}
                  </span>
                  {event.isRegistrationRequired ? (
                    <span className="inline-block mt-1 px-2.5 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold rounded-lg text-xs">
                      {language === "kn" ? "ಪೂರ್ವ ನೋಂದಣಿ ಕಡ್ಡಾಯ" : language === "hi" ? "पूर्व पंजीकरण आवश्यक" : "Prior Registration Required"}
                    </span>
                  ) : (
                    <span className="inline-block mt-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold rounded-lg text-xs">
                      {language === "kn" ? "ಉಚಿತ ಮತ್ತು ಎಲ್ಲರಿಗೂ ಮುಕ್ತ" : language === "hi" ? "निःशुल्क और सभी के लिए खुला" : "Free & Open to All Citizens"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action / Registration Button */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                {event.isRegistrationRequired ? (
                  event.registrationLink ? (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{language === "kn" ? "ಈ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ನೋಂದಾಯಿಸಿ" : language === "hi" ? "इस कार्यक्रम के लिए पंजीकरण करें" : "Register for this Event"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center space-y-1">
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        {language === "kn" ? "ಪುರಸಭೆ ಕೌಂಟರ್‌ನಲ್ಲಿ ನೋಂದಣಿ" : language === "hi" ? "नगर पालिका काउंटर पर पंजीकरण" : "Registration at TMC Counter"}
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        {language === "kn"
                          ? "ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಕಚೇರಿ ಅಥವಾ ಸಹಾಯವಾಣಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ."
                          : language === "hi"
                          ? "आरएसवीपी हेतु लक्ष्मेश्वर नगर पालिका कार्यालय या हेल्पलाइन पर संपर्क करें।"
                          : "Visit Lakshmeshwar Municipal Office or contact helpline to RSVP."}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === "kn" ? "ಯಾವುದೇ ಪಾಸ್ ಅಗತ್ಯವಿಲ್ಲ" : language === "hi" ? "किसी पास की आवश्यकता नहीं" : "No Prior Pass Needed"}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {language === "kn" ? "ಎಲ್ಲಾ ನಾಗರಿಕರಿಗೂ ಆದರದ ಸುಸ್ವಾಗತ." : language === "hi" ? "सभी निवासियों का हार्दिक स्वागत है।" : "All residents are welcome to join."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Helpline Contact Card */}
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] text-xs space-y-2">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold">
                <Phone className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>{language === "kn" ? "ಪುರಸಭೆ ಸಹಾಯವಾಣಿ" : language === "hi" ? "नगर पालिका हेल्पलाइन" : "Municipal Event Helpline"}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {language === "kn"
                  ? "ಸ್ಥಳ, ವೇದಿಕೆ ಅಥವಾ ಸಾಂಸ್ಕೃತಿಕ ಭಾಗವಹಿಸುವಿಕೆಯ ಕುರಿತು ಯಾವುದೇ ಮಾಹಿತಿಗಾಗಿ:"
                  : language === "hi"
                  ? "स्थान पहुंच, मंच व्यवस्था या सांस्कृतिक भागीदारी के प्रश्नों हेतु:"
                  : "For questions regarding venue access, stage arrangements, or cultural participation:"}
              </p>
              <p className="font-bold text-teal-800 dark:text-teal-300">
                TMC Lakshmeshwar: 08378-220034
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
