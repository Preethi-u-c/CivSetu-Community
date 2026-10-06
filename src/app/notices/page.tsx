"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  Clock,
  Building,
  Share2,
  Check,
  RefreshCw,
  Droplets,
  Zap,
  Trash2,
  Construction,
  ShieldAlert,
  FileText,
  ChevronRight,
  ExternalLink,
  Target,
  UserCheck,
} from "lucide-react";
import { wardsData } from "@/data/wards";
import { NoticeRecord } from "@/lib/db/notices";
import { useAuth } from "@/context/AuthContext";
import { VoiceInputButton } from "@/components/Voice/VoiceInputButton";
import { useAccessibility } from "@/context/AccessibilityContext";
import { NOTICES_TRANSLATIONS, NOTICES_CATEGORY_MAP } from "@/data/noticesTranslations";

const CATEGORY_TABS = [
  { id: "ALL", label: "All Updates", icon: Bell },
  { id: "Water Supply Announcements", label: "Water Supply", icon: Droplets },
  { id: "Electricity Interruptions", label: "Electricity", icon: Zap },
  { id: "Sanitation Notices", label: "Sanitation", icon: Trash2 },
  { id: "Road Work", label: "Road Work", icon: Construction },
  { id: "Emergency Alerts", label: "Emergency Alerts", icon: ShieldAlert },
  { id: "Municipal Announcements", label: "Municipal Circulars", icon: FileText },
];

function NoticesContent() {
  const { language } = useAccessibility();
  const { citizen, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const urlWard = searchParams?.get("ward") || "";
  const urlCategory = searchParams?.get("category") || "ALL";
  const urlOnlyWard = searchParams?.get("onlyWard") === "true";

  const [allNotices, setAllNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [selectedWard, setSelectedWard] = useState(urlWard || "ALL");
  const [onlyWard, setOnlyWard] = useState(urlOnlyWard);
  const [urgentOnly, setUrgentOnly] = useState(false);

  // If citizen is logged in and no ward was specified in URL, automatically default to their ward
  useEffect(() => {
    if (!urlWard && isAuthenticated && citizen?.wardNumber && selectedWard === "ALL") {
      // Find matching ward in wardsData or set directly
      setSelectedWard(citizen.wardNumber);
    }
  }, [isAuthenticated, citizen, urlWard]);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notices?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllNotices(json.data);
      }
    } catch (err) {
      console.error("Failed to load public notices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Instant zero-latency filter on tab click or keystroke
  const filteredNotices = useMemo(() => {
    return allNotices.filter((n) => {
      if (activeCategory !== "ALL" && n.category !== activeCategory) return false;
      if (urgentOnly && !n.isEmergency) return false;
      if (selectedWard !== "ALL") {
        const wStr = selectedWard.toLowerCase();
        const tWards = (n.targetWards || "").toLowerCase();
        const wardMatch =
          tWards.includes(wStr) ||
          tWards.includes("all wards") ||
          tWards.includes("all citizens") ||
          tWards.includes("entire municipality");
        if (!wardMatch) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inTitle = n.title.toLowerCase().includes(q);
        const inDesc = n.description.toLowerCase().includes(q);
        const inDept = n.issuedByDepartment.toLowerCase().includes(q);
        const inWard = (n.targetWards || "").toLowerCase().includes(q);
        return inTitle || inDesc || inDept || inWard;
      }
      return true;
    });
  }, [allNotices, activeCategory, urgentOnly, selectedWard, search]);

  // Find active emergency notices for the top emergency banner
  const emergencyNotices = useMemo(() => {
    return allNotices.filter((n) => n.isEmergency);
  }, [allNotices]);

  const copyShareLink = (id: string) => {
    const url = `${window.location.origin}/notices/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryTheme = (category: string) => {
    if (category.includes("Water")) {
      return {
        badge: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
        icon: Droplets,
      };
    }
    if (category.includes("Electricity")) {
      return {
        badge: "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        icon: Zap,
      };
    }
    if (category.includes("Sanitation") || category.includes("Health")) {
      return {
        badge: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        icon: Trash2,
      };
    }
    if (category.includes("Road") || category.includes("Works")) {
      return {
        badge: "bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        icon: Construction,
      };
    }
    if (category.includes("Emergency")) {
      return {
        badge: "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        icon: ShieldAlert,
      };
    }
    return {
      badge: "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      icon: FileText,
    };
  };

  // Helper to check if a notice is targeted specifically to citizen's ward
  const isDirectCitizenWardMatch = (notice: NoticeRecord): boolean => {
    if (!isAuthenticated || !citizen?.wardNumber || !notice.targetWards) return false;
    const cw = citizen.wardNumber.toLowerCase();
    const tw = notice.targetWards.toLowerCase();
    return tw.includes(cw) || (cw.includes("ward ") && tw.includes(cw.replace("ward ", "ward 0")));
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6 space-y-6">
      {/* Top Page Header */}
      <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>
              {language === "kn"
                ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ • ಅಧಿಕೃತ ಗೆಜೆಟ್"
                : language === "hi"
                ? "लक्ष्मेश्वर नगर पालिका • आधिकारिक राजपत्र"
                : "Lakshmeshwar Town Municipal Council • Official Gazette"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === "kn"
              ? "ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆಗಳು ಹಾಗೂ ವಾರ್ಡ್ ವರದಿಗಳು"
              : language === "hi"
              ? "सार्वजनिक घोषणाएं एवं वार्ड अपडेट"
              : "Public Announcements & Ward Updates"}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {language === "kn"
              ? "ನಿಗದಿತ ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು, ವಿದ್ಯುತ್ ವ್ಯತ್ಯಯ, ರಸ್ತೆ ಕಾಮಗಾರಿ, ನೈರ್ಮಲ್ಯ ಅಭಿಯಾನ ಮತ್ತು ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳ ಕುರಿತು 23 ವಾರ್ಡ್‌ಗಳ ನೈಜ-ಸಮಯದ ಪುರಸಭೆ ಪ್ರಕಟಣೆಗಳು."
              : language === "hi"
              ? "पेयजल आपूर्ति, बिजली कटौती, सड़क कार्य, स्वच्छता अभियान और आपातकालीन अलर्ट हेतु सभी 23 वार्डों के वास्तविक समय के अपडेट।"
              : "Real-time notifications for scheduled drinking water supplies, power interruptions, road works, sanitation drives, and civic emergency alerts targeted across all 23 municipal wards."}
          </p>
        </div>
      </div>

      {/* Citizen Ward Guidance Callout (When logged in) */}
      {isAuthenticated && citizen && (
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#064E4A] text-white flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                  Welcome, {citizen.fullName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#064E4A] text-white">
                  {citizen.wardNumber}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Announcements affecting your registered locality are prioritized automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedWard !== citizen.wardNumber ? (
              <button
                onClick={() => {
                  setSelectedWard(citizen.wardNumber);
                  setOnlyWard(false);
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#064E4A] text-white text-xs font-bold shadow-sm hover:bg-[#0B6B63] transition flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Filter to My Ward ({citizen.wardNumber})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedWard("ALL");
                  setOnlyWard(false);
                }}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Show All Municipality
              </button>
            )}
          </div>
        </div>
      )}

      {/* Emergency Alerts Banner (if active) */}
      {emergencyNotices.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 font-black text-sm uppercase tracking-wide">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Active Emergency Civic Advisory ({emergencyNotices.length})</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">
              Immediate Citizen Attention Required
            </span>
          </div>

          <div className="space-y-2">
            {emergencyNotices.map((em) => (
              <div
                key={em.id}
                className="p-3 rounded-xl bg-white dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-rose-900 dark:text-rose-100">
                    {em.title}
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300 line-clamp-1">
                    {em.description}
                  </p>
                </div>
                <Link
                  href={`/notices/${em.id}`}
                  className="inline-flex items-center gap-1 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-lg shadow-sm transition whitespace-nowrap self-start sm:self-center"
                >
                  <span>Read Emergency Circular</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          const label = language === "kn"
            ? (NOTICES_CATEGORY_MAP[tab.id]?.kn || tab.label)
            : language === "hi"
            ? (NOTICES_CATEGORY_MAP[tab.id]?.hi || tab.label)
            : tab.label;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-[#064E4A] text-white border-[#064E4A] shadow-sm"
                  : "bg-white dark:bg-[#061817] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Ward Selector Bar */}
      <div className="bg-white dark:bg-[#061817] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "kn"
                  ? "ಪ್ರಕಟಣೆಗಳನ್ನು ಹುಡುಕಿ (ಉದಾ: ಕುಡಿಯುವ ನೀರು, ವಿದ್ಯುತ್, ರಸ್ತೆ ಕಾಮಗಾರಿ)..."
                  : language === "hi"
                  ? "घोषणाएं खोजें (उदा: पेयजल, बिजली कटौती, सड़क कार्य)..."
                  : "Search announcements (e.g. water pipeline, power outage, tax)..."
              }
              className="w-full pl-9 pr-12 py-2.5 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                size="sm"
                onTranscript={(text) => setSearch((prev) => (prev ? `${prev} ${text}` : text))}
                ariaLabel="Search announcements using microphone voice input"
              />
            </div>
          </div>

          {/* Ward Targeting Selector */}
          <div className="sm:col-span-4 relative">
            <div className="flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <MapPin className="w-4 h-4" />
              </span>
              <select
                value={selectedWard}
                onChange={(e) => {
                  setSelectedWard(e.target.value);
                  if (e.target.value === "ALL") {
                    setOnlyWard(false);
                  }
                }}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600 font-semibold"
              >
                <option value="ALL">All Wards (Entire Municipality)</option>
                {wardsData.map((w) => {
                  const val = `Ward ${String(w.wardNumber).padStart(2, "0")}`;
                  const isCitizenWard = citizen?.wardNumber && (citizen.wardNumber === val || citizen.wardNumber.includes(String(w.wardNumber)));
                  return (
                    <option key={w.wardNumber} value={val}>
                      Ward {w.wardNumber} - {w.name} {isCitizenWard ? "(Your Ward)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Emergency Only Filter */}
          <div className="sm:col-span-3">
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                urgentOnly
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{urgentOnly ? "All Priorities" : "Emergency Only"}</span>
            </button>
          </div>
        </div>

        {/* Selected Ward Hint & Scope Toggle */}
        {selectedWard !== "ALL" && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] text-[#064E4A] dark:text-teal-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {onlyWard ? (
                  <>Showing exclusively notices targeted specifically to <strong>{selectedWard}</strong>.</>
                ) : (
                  <>Showing notices affecting <strong>{selectedWard}</strong> plus city-wide municipal circulars and emergency alerts.</>
                )}
              </span>
              <button
                onClick={() => {
                  setSelectedWard("ALL");
                  setOnlyWard(false);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600 underline"
              >
                Clear Ward Filter
              </button>
            </div>

            {/* Checkbox toggle: Only this ward */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={onlyWard}
                onChange={(e) => setOnlyWard(e.target.checked)}
                className="w-4 h-4 rounded text-[#064E4A] focus:ring-teal-500 border-gray-300 dark:border-gray-700"
              />
              <span>Show only notices targeted specifically to {selectedWard}</span>
            </label>
          </div>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center bg-white dark:bg-[#061817] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs text-gray-500">Loading municipal gazette notifications...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-[#061817] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
            <Bell className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">
              No Municipal Notices Found
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              There are currently no active public announcements matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("ALL");
                setSelectedWard("ALL");
                setOnlyWard(false);
                setUrgentOnly(false);
              }}
              className="px-4 py-2 rounded-lg bg-[#064E4A] text-white text-xs font-bold shadow hover:bg-[#0B6B63] transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredNotices.map((n) => {
            const localized = language === "kn" 
              ? NOTICES_TRANSLATIONS[n.id]?.kn 
              : language === "hi" 
              ? NOTICES_TRANSLATIONS[n.id]?.hi 
              : null;

            const displayTitle = localized?.title || n.title;
            const displayDesc = localized?.description || n.description;
            const displayCat = localized?.category || (NOTICES_CATEGORY_MAP[n.category]?.[language as "kn" | "hi"] || n.category);
            const displayDept = localized?.department || n.issuedByDepartment;

            const theme = getCategoryTheme(n.category);
            const CategoryIcon = theme.icon;
            const isCopied = copiedId === n.id;
            const isCitizenWard = isDirectCitizenWardMatch(n);

            return (
              <article
                key={n.id}
                id={n.id}
                className={`p-6 rounded-2xl border bg-white dark:bg-[#061817] shadow-sm space-y-4 transition ${
                  n.isEmergency
                    ? "border-rose-300 dark:border-rose-900 bg-rose-50/10"
                    : isCitizenWard
                    ? "border-teal-300 dark:border-teal-800/80 bg-teal-50/15"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${theme.badge}`}
                    >
                      <CategoryIcon className="w-3.5 h-3.5" />
                      <span>{displayCat}</span>
                    </span>

                    {/* Emergency Alert Tag */}
                    {n.isEmergency && (
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-rose-600 text-white flex items-center gap-1 shadow-sm animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> {language === "kn" ? "ತುರ್ತು ಎಚ್ಚರಿಕೆ" : language === "hi" ? "आपातकालीन चेतावनी" : "CRITICAL ALERT"}
                      </span>
                    )}

                    {/* Directly impacts citizen's ward badge */}
                    {isCitizenWard && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700 flex items-center gap-1 shadow-sm">
                        <Target className="w-3 h-3 text-[#064E4A] dark:text-teal-400" />
                        <span>{language === "kn" ? `ನಿಮ್ಮ ವಾರ್ಡ್‌ಗೆ ಅನ್ವಯ (${citizen?.wardNumber})` : language === "hi" ? `आपके वार्ड पर लागू (${citizen?.wardNumber})` : `Directly Impacts Your Ward (${citizen?.wardNumber})`}</span>
                      </span>
                    )}

                    {/* Priority */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        n.priority === "Urgent"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : n.priority === "High"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {n.priority === "Urgent"
                        ? language === "kn" ? "ಅತಿ ತುರ್ತು" : language === "hi" ? "अति आवश्यक" : "Urgent Priority"
                        : n.priority === "High"
                        ? language === "kn" ? "ಹೆಚ್ಚಿನ ಆದ್ಯತೆ" : language === "hi" ? "उच्च प्राथमिकता" : "High Priority"
                        : language === "kn" ? "ಸಾಮಾನ್ಯ" : language === "hi" ? "सामान्य" : `${n.priority} Priority`}
                    </span>
                  </div>

                  {/* Share & Notice ID */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">#{n.id}</span>
                    <button
                      onClick={() => copyShareLink(n.id)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      title="Copy Share Link"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Title & Scope */}
                <div className="space-y-1.5">
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-snug">
                    <Link
                      href={`/notices/${n.id}`}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition"
                    >
                      {displayTitle}
                    </Link>
                  </h2>

                  {/* Target Scope */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {language === "kn" ? "ವ್ಯಾಪ್ತಿ:" : language === "hi" ? "भौगोलिक दायरा:" : "Geographic Scope:"}
                    </span>
                    <span className="font-medium">
                      {n.targetScope === "Emergency / city-wide" ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {language === "kn" ? "ತುರ್ತು / ನಗರ-ವ್ಯಾಪ್ತಿಯ ಪ್ರಕಟಣೆ (ಎಲ್ಲಾ ನಾಗರಿಕರಿಗೆ)" : language === "hi" ? "आपातकालीन / नगर-व्यापी प्रसारण (सभी नागरिक)" : "Emergency / City-Wide Broadcast (All Citizens)"}
                        </span>
                      ) : n.targetScope === "All citizens" ? (
                        <span className="text-teal-700 dark:text-teal-300 font-semibold">
                          {language === "kn" ? "ಲಕ್ಷ್ಮೇಶ್ವರದ ಎಲ್ಲಾ ನಾಗರಿಕರು (01 - 23)" : language === "hi" ? "लक्ष्मेश्वर के सभी नागरिक (01 - 23)" : "All Citizens across Lakshmeshwar (01 - 23)"}
                        </span>
                      ) : n.targetScope === "Entire municipality" || n.targetScope === "Entire Municipality" ? (
                        <span className="text-teal-700 dark:text-teal-300 font-semibold">
                          {language === "kn" ? "ಸಮಗ್ರ ಪುರಸಭೆ ವ್ಯಾಪ್ತಿ" : language === "hi" ? "संपूर्ण नगर पालिका क्षेत्र" : "Entire Municipality (City-Wide)"}
                        </span>
                      ) : (
                        <span className="text-blue-700 dark:text-blue-300 font-semibold">
                          {language === "kn" ? `ನಿಗದಿತ ವಾರ್ಡ್: ${n.targetWards}` : language === "hi" ? `विशिष्ट वार्ड: ${n.targetWards}` : `Specific Ward(s): ${n.targetWards || "Selected Localities"}`}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {displayDesc}
                </p>

                {/* Footer Authority & Validity */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                      <span>
                        Published:{" "}
                        {new Date(n.publishDate).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>

                    {n.expiryDate && (
                      <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Valid until:{" "}
                          {new Date(n.expiryDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                    )}

                    <span className="text-gray-400">
                      Issued by: {n.issuedByName} ({n.issuedByDepartment})
                    </span>
                  </div>

                  <Link
                    href={`/notices/${n.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    <span>Full Gazette View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Citizen Help & Grievance Callout Box */}
      <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100">
            Experiencing water, electricity, or sanitation disruptions in your ward?
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Submit an official grievance to Lakshmeshwar Town Municipal Council with automatic SLA escalation.
          </p>
        </div>
        <Link
          href="/complaints/new"
          className="px-5 py-2.5 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs sm:text-sm font-bold shadow transition whitespace-nowrap"
        >
          File Ward Grievance →
        </Link>
      </div>
    </div>
  );
}

export default function PublicNoticesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1380px] mx-auto p-12 text-center text-xs text-gray-500">
          Loading municipal announcements gazette...
        </div>
      }
    >
      <NoticesContent />
    </Suspense>
  );
}
