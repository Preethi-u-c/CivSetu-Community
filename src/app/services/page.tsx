"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  Search,
  Building,
  ArrowRight,
  RefreshCw,
  Clock,
  Phone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  FileCheck2,
  Droplets,
  Trash2,
  Home,
  HeartPulse,
  Award,
  AlertTriangle,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { VoiceInputButton } from "@/components/Voice/VoiceInputButton";
import {
  CitizenService,
  SERVICE_CATEGORIES,
  SERVICE_DEPARTMENTS,
  ServiceCategory,
} from "@/lib/types/services";

import { useAccessibility } from "@/context/AccessibilityContext";
import {
  SERVICES_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  DEPARTMENT_TRANSLATIONS,
} from "@/data/serviceTranslations";

function ServicesContent() {
  const { t, language } = useAccessibility();
  const searchParams = useSearchParams();

  const urlCategory = searchParams?.get("category") || "ALL";
  const urlDepartment = searchParams?.get("department") || "ALL";

  const [allServices, setAllServices] = useState<CitizenService[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [selectedDepartment, setSelectedDepartment] = useState(urlDepartment);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllServices(json.data);
      }
    } catch (err) {
      console.error("Failed to load citizen services:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Instant zero-latency filter on button click or keystroke
  const filteredServices = useMemo(() => {
    return allServices.filter((s) => {
      if (activeCategory !== "ALL" && s.category !== activeCategory) return false;
      if (selectedDepartment !== "ALL" && s.department !== selectedDepartment) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const localized =
          language === "kn"
            ? SERVICES_TRANSLATIONS[s.id]?.kn
            : language === "hi"
            ? SERVICES_TRANSLATIONS[s.id]?.hi
            : null;

        const nameStr = `${s.name} ${localized?.name || ""}`.toLowerCase();
        const descStr = `${s.description} ${localized?.description || ""}`.toLowerCase();
        const deptStr = `${s.department} ${localized?.department || ""}`.toLowerCase();
        const procStr = s.procedure.toLowerCase();
        const eligStr = `${s.eligibility} ${localized?.eligibility || ""}`.toLowerCase();

        return (
          nameStr.includes(q) ||
          descStr.includes(q) ||
          deptStr.includes(q) ||
          procStr.includes(q) ||
          eligStr.includes(q)
        );
      }
      return true;
    });
  }, [allServices, activeCategory, selectedDepartment, search, language]);

  const translateCategory = (cat: string) => {
    if (language === "kn") return CATEGORY_TRANSLATIONS[cat]?.kn || cat;
    if (language === "hi") return CATEGORY_TRANSLATIONS[cat]?.hi || cat;
    return cat;
  };

  const translateDepartment = (dept: string) => {
    if (language === "kn") return DEPARTMENT_TRANSLATIONS[dept]?.kn || dept;
    if (language === "hi") return DEPARTMENT_TRANSLATIONS[dept]?.hi || dept;
    return dept;
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.includes("Water")) return Droplets;
    if (cat.includes("Sanitation")) return Trash2;
    if (cat.includes("Property")) return Home;
    if (cat.includes("Birth")) return HeartPulse;
    if (cat.includes("Certificates")) return Award;
    if (cat.includes("Applications")) return Building;
    if (cat.includes("Grievance")) return ShieldCheck;
    if (cat.includes("Emergency")) return AlertTriangle;
    return Briefcase;
  };

  const getCategoryTheme = (cat: string) => {
    if (cat.includes("Water")) {
      return {
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200",
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
      };
    }
    if (cat.includes("Sanitation")) {
      return {
        badge: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200",
        iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
      };
    }
    if (cat.includes("Property")) {
      return {
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
        iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      };
    }
    if (cat.includes("Birth")) {
      return {
        badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200",
        iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400",
      };
    }
    if (cat.includes("Certificates")) {
      return {
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
        iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      };
    }
    if (cat.includes("Emergency")) {
      return {
        badge: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200",
        iconBg: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
      };
    }
    return {
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200",
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    };
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6 space-y-8">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>
              {language === "kn"
                ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ • ನಾಗರಿಕ ಸೇವೆಗಳ ವಿವರಣೆ"
                : language === "hi"
                ? "लक्ष्मेश्वर नगर पालिका परिषद • नागरिक सेवा निर्देशिका"
                : "Lakshmeshwar Town Municipal Council • Citizen Services Directory"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === "kn"
              ? "ಪುರಸಭೆಯ ನಾಗರಿಕ ಸೇವೆಗಳು ಮತ್ತು ಸೌಲಭ್ಯಗಳು"
              : language === "hi"
              ? "नगर पालिका नागरिक सेवाएं एवं सुविधाएं"
              : "Municipal Citizen Services & Utilities"}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {language === "kn"
              ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಎಲ್ಲಾ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು, ಶಾಸನಬದ್ಧ ಕಾಲಮಿತಿ (SLA), ಅರ್ಹತಾ ಮಾನದಂಡಗಳು, ಅಗತ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಕೊಂಡಿಗಳನ್ನು ಇಲ್ಲಿ ಸುಲಭವಾಗಿ ಪಡೆಯಿರಿ."
              : language === "hi"
              ? "लक्ष्मेश्वर में सभी नगर पालिका सेवाओं, वैधानिक समय सीमा (SLA), पात्रता दिशानिर्देशों, आवश्यक दस्तावेजों और ऑनलाइन आवेदन की पूरी जानकारी।"
              : "Access transparent municipal procedures, statutory turnaround times (SLA), eligibility guidelines, document checklists, and application links for all municipal utilities in Lakshmeshwar."}
          </p>
        </div>

        {/* Quick Access Badges */}
        <div className="mt-5 pt-4 border-t border-teal-600/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ಸೇವೆಗಳ ವಿವರ" : language === "hi" ? "सेवाएं सूची" : "Catalog Services"}
            </span>
            <strong className="text-base text-white font-bold">
              {filteredServices.length}{" "}
              {language === "kn"
                ? "ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು"
                : language === "hi"
                ? "सार्वजनिक सेवाएं"
                : "Public Services"}
            </strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ಆನ್‌ಲೈನ್ ಟ್ರ್ಯಾಕಿಂಗ್" : language === "hi" ? "ऑनलाइन ट्रैकिंग" : "Online Tracking"}
            </span>
            <strong className="text-base text-white font-bold">
              {language === "kn" ? "ನೈಜ-ಸಮಯದ SLA" : language === "hi" ? "रियल-टाइम SLA" : "Real-Time SLA"}
            </strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ತುರ್ತು ಸಹಾಯವಾಣಿ" : language === "hi" ? "आपातकालीन हेल्पलाइन" : "Emergency Hotline"}
            </span>
            <strong className="text-base text-white font-bold">24x7 (08378-220034)</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ಸೇವಾ ಕೇಂದ್ರ" : language === "hi" ? "सेवा केंद्र" : "Service Center"}
            </span>
            <strong className="text-base text-white font-bold">
              {language === "kn"
                ? "ಟಿಎಂಸಿ ಜನಸೇವಾ ಕೌಂಟರ್"
                : language === "hi"
                ? "टीएमसी जनसेवा काउंटर"
                : "TMC Janaseva Counter"}
            </strong>
          </div>
        </div>
      </div>

      {/* Emergency Alert Ribbon */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {language === "kn"
              ? "ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದಿರುವುದು, ರಸ್ತೆಗೆ ಮರ ಬಿದ್ದಿರುವುದು ಅಥವಾ ಒಳಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವಂತಹ ತುರ್ತು ಸಮಸ್ಯೆಗಳಿವೆಯೇ?"
              : language === "hi"
              ? "क्या पेयजल पाइप फटने, पेड़ गिरने या सीवर चोक जैसी किसी गंभीर नागरिक आपात स्थिति का सामना कर रहे हैं?"
              : "Facing an urgent civic breakdown like burst drinking water pipe, fallen tree, or clogged drainage?"}
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
          <Link
            href="/complaints/new"
            prefetch={true}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
          >
            {language === "kn" ? "ತುರ್ತು ದೂರು ದಾಖಲಿಸಿ" : language === "hi" ? "आपातकालीन शिकायत दर्ज करें" : "Lodge Urgent Grievance"}
          </Link>
          <a
            href="tel:08378220034"
            className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-200 font-bold rounded-lg hover:bg-amber-100 transition"
          >
            {language === "kn" ? "ಕರೆ ಮಾಡಿ: 08378-220034" : language === "hi" ? "कॉल करें: 08378-220034" : "Call 08378-220034"}
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "kn"
                  ? "ಸೇವೆಯ ಹೆಸರು, ಇಲಾಖೆ ಅಥವಾ ಅಗತ್ಯ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಿ..."
                  : language === "hi"
                  ? "सेवा का नाम, विभाग या आवश्यक दस्तावेज खोजें..."
                  : "Search service name, procedure, department, or required documents..."
              }
              className="w-full pl-9 pr-12 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                size="sm"
                onTranscript={(text) => setSearch((prev) => (prev ? `${prev} ${text}` : text))}
                ariaLabel="Search citizen services using microphone voice input"
              />
            </div>
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
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">
                {language === "kn" ? "ಎಲ್ಲಾ ಇಲಾಖೆಗಳು" : language === "hi" ? "सभी विभाग" : "All Departments"}
              </option>
              {SERVICE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {translateDepartment(dept)}
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
            {language === "kn" ? "ಎಲ್ಲಾ ಸೇವೆಗಳು" : language === "hi" ? "सभी सेवाएं" : "All Services"}
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
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

      {/* Services Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "kn"
              ? "ನಾಗರಿಕ ಸೇವೆಗಳ ಪಟ್ಟಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..."
              : language === "hi"
              ? "नागरिक सेवाएं लोड की जा रही हैं..."
              : "Loading citizen services catalog..."}
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            {language === "kn"
              ? "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ನಾಗರಿಕ ಸೇವೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
              : language === "hi"
              ? "आपकी खोज के अनुसार कोई नागरिक सेवा नहीं मिली"
              : "No citizen services found matching your criteria"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {language === "kn"
              ? "ದಯವಿಟ್ಟು ಬೇರೆ ಹುಡುಕು ಪದಗಳನ್ನು ಅಥವಾ ಬೇರೆ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ."
              : language === "hi"
              ? "कृपया दूसरा शब्द खोजें या अन्य सेवा श्रेणी चुनें।"
              : "Try adjusting your search query or choosing another service category."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveCategory("ALL");
                setSelectedDepartment("ALL");
                setSearch("");
              }}
              className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-semibold transition"
            >
              {language === "kn" ? "ಫಿಲ್ಟರ್ ಮರುಹೊಂದಿಸಿ" : language === "hi" ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = getCategoryIcon(service.category);
            const theme = getCategoryTheme(service.category);

            const localized =
              language === "kn"
                ? SERVICES_TRANSLATIONS[service.id]?.kn
                : language === "hi"
                ? SERVICES_TRANSLATIONS[service.id]?.hi
                : null;

            const serviceName = localized?.name || service.name;
            const serviceCat = localized?.category || translateCategory(service.category);
            const serviceDept = localized?.department || translateDepartment(service.department);
            const serviceDesc = localized?.description || service.description;
            const serviceTimeline = localized?.expectedTimeline || service.expectedTimeline;
            const serviceFee = localized?.fee || service.fee || (language === "kn" ? "ಉಚಿತ" : language === "hi" ? "निःशुल्क" : "Free of Cost");
            const serviceElig = localized?.eligibility || service.eligibility;
            const docCount = localized?.requiredDocuments?.length ?? service.requiredDocuments.length;

            return (
              <div
                key={service.id}
                className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Category Badge & SLA Timeline */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${theme.badge}`}
                    >
                      {serviceCat}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{serviceTimeline}</span>
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className={`p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 ${theme.iconBg} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 group-hover:text-[#064E4A] dark:group-hover:text-teal-300 transition leading-snug">
                        {serviceName}
                      </h3>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate max-w-[200px]">{serviceDept}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {serviceDesc}
                  </p>

                  {/* Fee & Eligibility Snippet */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-semibold">
                        {language === "kn" ? "ಶಾಸನಬದ್ಧ ಶುಲ್ಕ:" : language === "hi" ? "वैधानिक शुल्क:" : "Statutory Fee:"}
                      </span>
                      <strong className="text-gray-800 dark:text-gray-200">{serviceFee}</strong>
                    </div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                      <span className="text-gray-400 font-semibold mr-1">
                        {language === "kn" ? "ಅರ್ಹತೆ:" : language === "hi" ? "पात्रता:" : "Eligibility:"}
                      </span>
                      {serviceElig}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <FileCheck2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <strong>{docCount}</strong>{" "}
                      {language === "kn"
                        ? "ಅಗತ್ಯ ದಾಖಲೆಗಳು"
                        : language === "hi"
                        ? "आवश्यक दस्तावेज"
                        : "required documents"}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{service.id}</span>
                  </div>

                  <Link
                    href={`/services/${service.id}`}
                    prefetch={true}
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#064E4A] hover:text-white dark:bg-gray-800/80 dark:hover:bg-[#064E4A] text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 group-hover:bg-[#064E4A] group-hover:text-white shadow-sm"
                  >
                    <span>
                      {language === "kn"
                        ? "ಮಾರ್ಗಸೂಚಿ ಮತ್ತು ಅರ್ಜಿ ವಿವರ"
                        : language === "hi"
                        ? "दिशानिर्देश एवं आवेदन प्रक्रिया"
                        : "View Guidelines & How to Apply"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1380px] mx-auto px-4 py-16 text-center">
          <RefreshCw className="w-8 h-8 text-[#064E4A] animate-spin mx-auto" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
