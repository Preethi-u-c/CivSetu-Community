"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
  Search,
  Building,
  ArrowRight,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Tag,
  AlertCircle,
  ExternalLink,
  Users,
  ChevronRight,
  Filter,
} from "lucide-react";
import { wardsData } from "@/data/wards";
import { useAuth } from "@/context/AuthContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import {
  MunicipalEvent,
  EVENT_CATEGORIES,
  DEFAULT_EVENT_IMAGE,
} from "@/lib/types/events";
import {
  EVENTS_TRANSLATIONS,
  EVENT_CATEGORY_MAP,
} from "@/data/eventTranslations";

function EventsContent() {
  const { citizen, isAuthenticated } = useAuth();
  const { language } = useAccessibility();
  const searchParams = useSearchParams();

  const urlWard = searchParams?.get("ward") || "";
  const urlCategory = searchParams?.get("category") || "ALL";
  const urlTime = (searchParams?.get("time") as "upcoming" | "past" | "all") || "upcoming";

  const [allEvents, setAllEvents] = useState<MunicipalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [selectedWard, setSelectedWard] = useState(urlWard || "ALL");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">(urlTime);

  // Auto-focus on citizen's ward if logged in and no ward in query
  useEffect(() => {
    if (!urlWard && isAuthenticated && citizen?.wardNumber && selectedWard === "ALL") {
      setSelectedWard(citizen.wardNumber);
    }
  }, [isAuthenticated, citizen, urlWard]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllEvents(json.data);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Instant zero-latency filter on tab or category click
  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return allEvents.filter((ev) => {
      // Time filter
      if (timeFilter === "upcoming" && ev.eventDate < today) return false;
      if (timeFilter === "past" && ev.eventDate >= today) return false;
      // Category filter
      if (activeCategory !== "ALL" && ev.category !== activeCategory) return false;
      // Ward filter
      if (selectedWard !== "ALL") {
        const wStr = selectedWard.toLowerCase();
        const tWard = (ev.wardRelevance || "").toLowerCase();
        const match = tWard.includes(wStr) || tWard.includes("all wards");
        if (!match) return false;
      }
      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inTitle = ev.title.toLowerCase().includes(q);
        const inDesc = ev.description.toLowerCase().includes(q);
        const inLoc = ev.location.toLowerCase().includes(q);
        const inOrg = ev.organizer.toLowerCase().includes(q);
        const inWard = (ev.wardRelevance || "").toLowerCase().includes(q);
        return inTitle || inDesc || inLoc || inOrg || inWard;
      }
      return true;
    });
  }, [allEvents, timeFilter, activeCategory, selectedWard, search]);

  const isCitizenWardMatch = (wardRelevance: string): boolean => {
    if (!isAuthenticated || !citizen?.wardNumber) return false;
    const cw = citizen.wardNumber.toLowerCase();
    const wr = wardRelevance.toLowerCase();
    return wr.includes(cw) || (cw.includes("ward ") && wr.includes(cw.replace("ward ", "ward 0")));
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const loc = language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-US";
      return {
        month: date.toLocaleDateString(loc, { month: "short" }).toUpperCase(),
        day: date.getDate(),
        year: date.getFullYear(),
        weekday: date.toLocaleDateString(loc, { weekday: "short" }),
        full: date.toLocaleDateString(loc, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
    } catch {
      return { month: "EVT", day: "--", year: "", weekday: "", full: dateStr };
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Festivals":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300";
      case "Public Meetings":
        return "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300";
      case "Municipal Programs":
        return "bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300";
      case "Awareness Campaigns":
        return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300";
      case "Cultural Events":
        return "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300";
      case "Civic Events":
      default:
        return "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300";
    }
  };

  const translateCategory = (cat: string) => {
    if (language === "kn") return EVENT_CATEGORY_MAP[cat]?.kn || cat;
    if (language === "hi") return EVENT_CATEGORY_MAP[cat]?.hi || cat;
    return cat;
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6 space-y-8">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>
              {language === "kn"
                ? "ಲಕ್ಷ್ಮೇಶ್ವರ ನಗರ ದಿನದರ್ಶಿಕೆ • ಸಮುದಾಯ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಹಬ್ಬಗಳು"
                : language === "hi"
                ? "लक्ष्मेश्वर नगर कैलेंडर • सामुदायिक उत्सव एवं कार्यक्रम"
                : "Lakshmeshwar Town Calendar • Community Gatherings & Festivals"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === "kn"
              ? "ಪುರಸಭೆ ಕಾರ್ಯಕ್ರಮಗಳು, ಸಾರ್ವಜನಿಕ ಸಭೆಗಳು ಮತ್ತು ಹಬ್ಬಗಳು"
              : language === "hi"
              ? "नगर पालिका कार्यक्रम, सार्वजनिक बैठकें एवं उत्सव"
              : "Events, Public Meetings & Festivals"}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {language === "kn"
              ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸಂಸ್ಥೆಗಳು ಆಯೋಜಿಸುವ ಮುಂಬರುವ ನಾಗರಿಕ ಕಾರ್ಯಕ್ರಮಗಳು, ವಾರ್ಡ್ ಸಮಾಲೋಚನೆಗಳು, ಐತಿಹಾಸಿಕ ಹಬ್ಬಗಳು, ಆರೋಗ್ಯ ಶಿಬಿರಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಉತ್ಸವಗಳನ್ನು ಇಲ್ಲಿ ತಿಳಿಯಿರಿ."
              : language === "hi"
              ? "लक्ष्मेश्वर नगर पालिका परिषद एवं स्थानीय संगठनों द्वारा आयोजित नागरिक कार्यक्रमों, वार्ड परामर्शों, ऐतिहासिक उत्सवों, स्वास्थ्य शिविरों और सांस्कृतिक कार्यक्रमों की जानकारी प्राप्त करें।"
              : "Discover upcoming civic programs, ward consultations, historical town festivals, health camps, and cultural events organized by Lakshmeshwar Town Municipal Council and community organizations."}
          </p>
        </div>

        {/* Citizen Registered Ward Status */}
        {isAuthenticated && citizen?.wardNumber && (
          <div className="mt-4 pt-4 border-t border-teal-600/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-teal-100">
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>
                {language === "kn" ? "ಲಾಗಿನ್ ಆಗಿರುವವರು: " : language === "hi" ? "लॉगिन उपयोगकर्ता: " : "Signed in as "}
                <strong className="text-white">{citizen.fullName}</strong> •{" "}
                {language === "kn" ? "ನಿಗದಿಪಡಿಸಿದ ವಾರ್ಡ್: " : language === "hi" ? "आवंटित वार्ड: " : "Assigned Ward: "}
                <strong className="text-amber-300 font-bold">{citizen.wardNumber}</strong>
              </span>
            </div>
            {selectedWard === citizen.wardNumber ? (
              <span className="flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                {language === "kn"
                  ? "ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ"
                  : language === "hi"
                  ? "आपके वार्ड के कार्यक्रम प्रदर्शित हैं"
                  : "Filtering for your residential area"}
              </span>
            ) : (
              <button
                onClick={() => setSelectedWard(citizen.wardNumber)}
                className="text-amber-300 hover:text-white underline font-semibold transition"
              >
                {language === "kn"
                  ? `ನನ್ನ ವಾರ್ಡ್ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ (${citizen.wardNumber})`
                  : language === "hi"
                  ? `मेरे वार्ड पर ध्यान दें (${citizen.wardNumber})`
                  : `Focus on my ward (${citizen.wardNumber})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Time Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeFilter("upcoming")}
              className={`px-4 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1.5 ${
                timeFilter === "upcoming"
                  ? "bg-[#064E4A] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {language === "kn" ? "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳು" : language === "hi" ? "आगामी कार्यक्रम" : "Upcoming Events"}
              </span>
            </button>
            <button
              onClick={() => setTimeFilter("past")}
              className={`px-4 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1.5 ${
                timeFilter === "past"
                  ? "bg-[#064E4A] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {language === "kn" ? "ಹಿಂದಿನ ಕಾರ್ಯಕ್ರಮಗಳು" : language === "hi" ? "पूर्व कार्यक्रम" : "Past Archives"}
              </span>
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
                timeFilter === "all"
                  ? "bg-[#064E4A] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {language === "kn" ? "ಎಲ್ಲಾ" : language === "hi" ? "सभी" : "All"}
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {language === "kn" ? "ತೋರಿಸಲಾಗುತ್ತಿದೆ: " : language === "hi" ? "प्रदर्शित: " : "Showing "}
            <strong className="text-gray-900 dark:text-gray-100">{filteredEvents.length}</strong>{" "}
            {language === "kn"
              ? "ಕಾರ್ಯಕ್ರಮಗಳು"
              : language === "hi"
              ? "कार्यक्रम"
              : `event${filteredEvents.length === 1 ? "" : "s"}`}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "kn"
                  ? "ಕಾರ್ಯಕ್ರಮದ ಶೀರ್ಷಿಕೆ, ಆಯೋಜಕರು ಅಥವಾ ಸ್ಥಳ ಹುಡುಕಿ..."
                  : language === "hi"
                  ? "कार्यक्रम शीर्षक, आयोजक अथवा स्थान खोजें..."
                  : "Search by event title, organizer, or venue..."
              }
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">
                {language === "kn" ? "ಎಲ್ಲಾ ವರ್ಗಗಳು" : language === "hi" ? "सभी श्रेणियां" : "All Categories"}
              </option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Ward Relevance Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">
                {language === "kn"
                  ? "ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳು / ಇಡೀ ನಗರ"
                  : language === "hi"
                  ? "सभी वार्ड / पूरा शहर"
                  : "All Wards / Entire Town"}
              </option>
              {wardsData.map((w) => (
                <option key={w.wardNumber} value={`Ward ${String(w.wardNumber).padStart(2, "0")}`}>
                  {language === "kn"
                    ? `ವಾರ್ಡ್ ${String(w.wardNumber).padStart(2, "0")} - ${w.nameKn || w.name}`
                    : `Ward ${String(w.wardNumber).padStart(2, "0")} - ${w.name}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 mr-1">
            <Filter className="w-3 h-3" />{" "}
            {language === "kn" ? "ತ್ವರಿತ ಫಿಲ್ಟರ್‌ಗಳು:" : language === "hi" ? "त्वरित फ़िल्टर:" : "Quick filters:"}
          </span>
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
              activeCategory === "ALL"
                ? "bg-[#064E4A] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {language === "kn" ? "ಎಲ್ಲಾ" : language === "hi" ? "सभी" : "All"}
          </button>
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
                activeCategory === cat
                  ? "bg-[#064E4A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {translateCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading Lakshmeshwar community events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            No events match your criteria
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {timeFilter === "upcoming"
              ? "There are currently no upcoming events scheduled for this category or ward. Check back soon or view past event archives."
              : "No events were found with the applied filters."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {(activeCategory !== "ALL" || selectedWard !== "ALL" || search) && (
              <button
                onClick={() => {
                  setActiveCategory("ALL");
                  setSelectedWard("ALL");
                  setSearch("");
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition"
              >
                Clear Filters
              </button>
            )}
            {timeFilter === "upcoming" && (
              <button
                onClick={() => setTimeFilter("all")}
                className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-semibold transition"
              >
                View All Events
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const dateObj = formatEventDate(event.eventDate);
            const isMatch = isCitizenWardMatch(event.wardRelevance);
            const isPast = new Date(event.eventDate) < new Date(new Date().toDateString());

            const localized = language === "kn" 
              ? EVENTS_TRANSLATIONS[event.id]?.kn 
              : language === "hi" 
              ? EVENTS_TRANSLATIONS[event.id]?.hi 
              : null;

            const displayTitle = localized?.title || event.title;
            const displayDesc = localized?.description || event.description;
            const displayLocation = localized?.location || event.location;
            const displayOrganizer = localized?.organizer || event.organizer;
            const displayCategory = localized?.category || translateCategory(event.category);

            return (
              <div
                key={event.id}
                className={`bg-white dark:bg-[#071d1b] border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group ${
                  isMatch
                    ? "border-teal-400 dark:border-teal-600 ring-1 ring-teal-400/30"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={event.imageUrl || DEFAULT_EVENT_IMAGE}
                    alt={displayTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Date Badge (Overlay) */}
                  <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#071d1b]/95 backdrop-blur-sm rounded-xl p-2 text-center shadow-md min-w-[50px] border border-gray-200/50">
                    <span className="block text-[10px] font-black text-rose-600 dark:text-rose-400 leading-none">
                      {dateObj.month}
                    </span>
                    <span className="block text-lg font-black text-gray-900 dark:text-white leading-tight">
                      {dateObj.day}
                    </span>
                    <span className="block text-[9px] font-semibold text-gray-500 uppercase leading-none">
                      {dateObj.weekday}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border shadow-sm ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {displayCategory}
                    </span>
                  </div>

                  {/* Status Overlay if Past or Registration */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-medium">
                      <Clock className="w-3 h-3 text-teal-300" />
                      {event.startTime} {event.endTime ? `– ${event.endTime}` : ""}
                    </span>

                    {event.isRegistrationRequired ? (
                      <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow">
                        {language === "kn" ? "ನೋಂದಣಿ ಕಡ್ಡಾಯ" : language === "hi" ? "पंजीकरण अनिवार्य" : "Reg. Required"}
                      </span>
                    ) : (
                      <span className="bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full text-[10px]">
                        {language === "kn" ? "ಎಲ್ಲರಿಗೂ ಮುಕ್ತ" : language === "hi" ? "सभी के लिए खुला" : "Open to All"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Ward Tag & Citizen Match indicator */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                      </span>
                      {isMatch && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-[#064E4A] dark:text-teal-300 flex-shrink-0">
                          {language === "kn" ? "ನಿಮ್ಮ ವಾರ್ಡ್" : language === "hi" ? "आपका वार्ड" : "Your Ward"}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-[#064E4A] dark:group-hover:text-teal-300 transition">
                      {displayTitle}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>

                  {/* Footer Meta & Button */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="truncate font-medium">
                        {language === "kn" ? "ಆಯೋಜಕರು:" : language === "hi" ? "आयोजक:" : "By:"} {displayOrganizer}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {event.wardRelevance}
                      </span>
                    </div>

                    <Link
                      href={`/events/${event.id}`}
                      className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#064E4A] hover:text-white dark:bg-gray-800/80 dark:hover:bg-[#064E4A] text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 group-hover:bg-[#064E4A] group-hover:text-white shadow-sm"
                    >
                      <span>
                        {isPast
                          ? language === "kn"
                            ? "ಕಾರ್ಯಕ್ರಮದ ಸಾರಾಂಶ ವೀಕ್ಷಿಸಿ"
                            : language === "hi"
                            ? "कार्यक्रम सारांश देखें"
                            : "View Event Summary"
                          : language === "kn"
                          ? "ವಿವರ ಮತ್ತು ನೋಂದಣಿ ವೀಕ್ಷಿಸಿ"
                          : language === "hi"
                          ? "विवरण और पंजीकरण देखें"
                          : "View Details & Register"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1380px] mx-auto px-4 py-16 text-center">
          <RefreshCw className="w-8 h-8 text-[#064E4A] animate-spin mx-auto" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
