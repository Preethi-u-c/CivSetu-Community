"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Landmark,
  Search,
  Building,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  Calendar,
  Phone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Award,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { VoiceInputButton } from "@/components/Voice/VoiceInputButton";
import {
  GovernmentScheme,
  SCHEME_CATEGORIES,
  SCHEME_DEPARTMENTS,
} from "@/lib/types/schemes";
import { useAccessibility } from "@/context/AccessibilityContext";
import { SCHEMES_TRANSLATIONS, SCHEME_CATEGORY_MAP } from "@/data/schemeTranslations";

function SchemesContent() {
  const { language } = useAccessibility();
  const searchParams = useSearchParams();

  const urlCategory = searchParams?.get("category") || "ALL";
  const urlDepartment = searchParams?.get("department") || "ALL";

  const [allSchemes, setAllSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [selectedDepartment, setSelectedDepartment] = useState(urlDepartment);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schemes?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllSchemes(json.data);
      }
    } catch (err) {
      console.error("Failed to load government schemes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Instant zero-latency filter on button click or keystroke
  const filteredSchemes = useMemo(() => {
    return allSchemes.filter((s) => {
      if (activeCategory !== "ALL" && s.category !== activeCategory) return false;
      if (selectedDepartment !== "ALL" && s.department !== selectedDepartment) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inName = s.name.toLowerCase().includes(q);
        const inDesc = s.description.toLowerCase().includes(q);
        const inDept = s.department.toLowerCase().includes(q);
        const inElig = s.eligibility.toLowerCase().includes(q);
        const inBen = s.benefits.toLowerCase().includes(q);
        return inName || inDesc || inDept || inElig || inBen;
      }
      return true;
    });
  }, [allSchemes, activeCategory, selectedDepartment, search]);

  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6 space-y-8">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Landmark className="w-4 h-4" />
            <span>
              {language === "kn"
                ? "ನಾಗರಿಕ ಕಲ್ಯಾಣ ಮತ್ತು ಸಾಮಾಜಿಕ ಭದ್ರತೆ • ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಹಾಗೂ ಕರ್ನಾಟಕ"
                : language === "hi"
                ? "नागरिक कल्याण एवं सामाजिक सुरक्षा • लक्ष्मेश्वर नगर एवं कर्नाटक"
                : "Civic Welfare & Social Security • Lakshmeshwar Town & Karnataka"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === "kn"
              ? "ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಹಾಗೂ ನಾಗರಿಕ ಯೋಜನೆಗಳು"
              : language === "hi"
              ? "सरकारी कल्याणकारी एवं नागरिक योजनाएं"
              : "Government Welfare & Civic Schemes"}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {language === "kn"
              ? "ಲಕ್ಷ್ಮೇಶ್ವರದ ನಿವಾಸಿಗಳಿಗೆ ಲಭ್ಯವಿರುವ ರಾಜ್ಯ ಮತ್ತು ಕೇಂದ್ರ ಸರ್ಕಾರಗಳ ನಾಗರಿಕ ಸಬಲೀಕರಣ ಕಾರ್ಯಕ್ರಮಗಳು, ಆರ್ಥಿಕ ಸಹಾಯಧನ, ನಗರ ವಸತಿ ನೆರವು, ಕುಶಲಕರ್ಮಿಗಳ ಜೀವನೋಪಾಯ ಮತ್ತು ಸ್ವಚ್ಛ ನೈರ್ಮಲ್ಯ ಅನುದಾನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ."
              : language === "hi"
              ? "लक्ष्मेश्वर निवासियों हेतु उपलब्ध राज्य एवं केंद्रीय नागरिक सशक्तिकरण कार्यक्रम, वित्तीय सब्सिडी, शहरी आवास सहायता और स्वच्छता अनुदान खोजें।"
              : "Explore state and central citizen empowerment programs, financial subsidies, urban housing support, artisan livelihoods, and clean sanitation grants available for Lakshmeshwar residents."}
          </p>
        </div>

        {/* Quick Highlights Counter */}
        <div className="mt-5 pt-4 border-t border-teal-600/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ಸಕ್ರಿಯ ಯೋಜನೆಗಳು" : language === "hi" ? "सक्रिय योजनाएं" : "Active Schemes"}
            </span>
            <strong className="text-base text-white font-bold">{filteredSchemes.length} {language === "kn" ? "ಕಾರ್ಯಕ್ರಮಗಳು" : language === "hi" ? "कार्यक्रम" : "Programs"}</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ವ್ಯಾಪ್ತಿ" : language === "hi" ? "कवरेज" : "Coverage"}
            </span>
            <strong className="text-base text-white font-bold">{language === "kn" ? "ಎಲ್ಲಾ 23 ವಾರ್ಡ್‌ಗಳು" : language === "hi" ? "सभी 23 वार्ड" : "All 23 Wards"}</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ಆನ್‌ಲೈನ್ ಪರಿಶೀಲನೆ" : language === "hi" ? "ऑनलाइन सत्यापन" : "Online Verifications"}
            </span>
            <strong className="text-base text-white font-bold">100% {language === "kn" ? "ಪಾರದರ್ಶಕ" : language === "hi" ? "पारदर्शी" : "Transparent"}</strong>
          </div>
          <div>
            <span className="text-teal-200 block text-[11px]">
              {language === "kn" ? "ಸಹಾಯ ಕೇಂದ್ರ" : language === "hi" ? "सहायता केंद्र" : "Assistance Center"}
            </span>
            <strong className="text-base text-white font-bold">
              {language === "kn" ? "ಪುರಸಭೆ ಜನಸೇವಾ ಕೇಂದ್ರ" : language === "hi" ? "जनसेवा केंद्र (TMC)" : "TMC Janaseva Kendra"}
            </strong>
          </div>
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
                  ? "ಯೋಜನೆಯ ಹೆಸರು, ಅರ್ಹತೆ, ಪ್ರಯೋಜನಗಳು ಅಥವಾ ಇಲಾಖೆಯನ್ನು ಹುಡುಕಿ..."
                  : language === "hi"
                  ? "योजना का नाम, पात्रता, लाभ या विभाग खोजें..."
                  : "Search scheme name, eligibility, benefits, or department..."
              }
              className="w-full pl-9 pr-12 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceInputButton
                size="sm"
                onTranscript={(text) => setSearch((prev) => (prev ? `${prev} ${text}` : text))}
                ariaLabel="Search government welfare schemes using microphone voice input"
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
              <option value="ALL">{language === "kn" ? "ಎಲ್ಲಾ ವರ್ಗಗಳು" : language === "hi" ? "सभी श्रेणियां" : "All Categories"}</option>
              {SCHEME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {language === "kn" ? (SCHEME_CATEGORY_MAP[cat]?.kn || cat) : language === "hi" ? (SCHEME_CATEGORY_MAP[cat]?.hi || cat) : cat}
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
              <option value="ALL">{language === "kn" ? "ಎಲ್ಲಾ ಇಲಾಖೆಗಳು" : language === "hi" ? "सभी विभाग" : "All Departments"}</option>
              {SCHEME_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 mr-1">
            <Filter className="w-3 h-3" /> {language === "kn" ? "ಯೋಜನಾ ಕ್ಷೇತ್ರ:" : language === "hi" ? "फोकस क्षेत्र:" : "Focus area:"}
          </span>
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
              activeCategory === "ALL"
                ? "bg-[#064E4A] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            {language === "kn" ? "ಎಲ್ಲಾ ಯೋಜನೆಗಳು" : language === "hi" ? "सभी योजनाएं" : "All Schemes"}
          </button>
          {SCHEME_CATEGORIES.map((cat) => {
            const label = language === "kn"
              ? (SCHEME_CATEGORY_MAP[cat]?.kn || cat)
              : language === "hi"
              ? (SCHEME_CATEGORY_MAP[cat]?.hi || cat)
              : cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
                  activeCategory === cat
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading government schemes directory...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            No schemes found matching your criteria
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try resetting your search query or selecting a different department/category.
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
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => {
            const locScheme = language === "kn" 
              ? SCHEMES_TRANSLATIONS[scheme.id]?.kn 
              : language === "hi" 
              ? SCHEMES_TRANSLATIONS[scheme.id]?.hi 
              : null;

            const displayName = locScheme?.name || scheme.name;
            const displayDept = locScheme?.department || scheme.department;
            const displayCat = locScheme?.category || (SCHEME_CATEGORY_MAP[scheme.category]?.[language as "kn" | "hi"] || scheme.category);
            const displayDesc = locScheme?.description || scheme.description;
            const displayBenefits = locScheme?.benefits || scheme.benefits;
            const displayEligibility = locScheme?.eligibility || scheme.eligibility;

            return (
              <div
                key={scheme.id}
                className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  {/* Department & Category */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {displayCat}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">
                      {scheme.deadline ? `${language === "kn" ? "ಅಂತಿಮ ದಿನಾಂಕ: " : language === "hi" ? "अंतिम तिथि: " : "Deadline: "}${scheme.deadline}` : "Open / Ongoing"}
                    </span>
                  </div>

                  {/* Scheme Name */}
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 group-hover:text-[#064E4A] dark:group-hover:text-teal-300 transition">
                    {displayName}
                  </h3>

                  {/* Department */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Building className="w-3.5 h-3.5 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                    <span className="truncate">{displayDept}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {displayDesc}
                  </p>

                  {/* Benefits Banner */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-amber-600" /> {language === "kn" ? "ಮುಖ್ಯ ನೆರವು / ಸೌಲಭ್ಯ" : language === "hi" ? "प्रमुख सहायता / लाभ" : "Key Assistance"}
                    </span>
                    <p className="text-xs text-amber-950 dark:text-amber-100 font-medium line-clamp-2">
                      {displayBenefits}
                    </p>
                  </div>

                  {/* Eligibility Snippet */}
                  <div className="space-y-1 text-xs">
                    <span className="text-gray-400 font-semibold block text-[11px]">
                      {language === "kn" ? "ಅರ್ಹತಾ ಮಾನದಂಡ:" : language === "hi" ? "पात्रता मानदंड:" : "Eligibility Criteria:"}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                      "{displayEligibility}"
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                      <strong>{scheme.documentsRequired.length}</strong> {language === "kn" ? "ಅಗತ್ಯ ದಾಖಲೆಗಳು" : language === "hi" ? "आवश्यक दस्तावेज" : "required documents"}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{scheme.id}</span>
                  </div>

                  <Link
                    href={`/schemes/${scheme.id}`}
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#064E4A] hover:text-white dark:bg-gray-800/80 dark:hover:bg-[#064E4A] text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 group-hover:bg-[#064E4A] group-hover:text-white shadow-sm"
                  >
                    <span>{language === "kn" ? "ಅರ್ಹತೆ ಮತ್ತು ಮಾರ್ಗಸೂಚಿ ಪರಿಶೀಲಿಸಿ" : language === "hi" ? "पात्रता एवं दिशानिर्देश देखें" : "Check Eligibility & Guidelines"}</span>
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

export default function SchemesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1380px] mx-auto px-4 py-16 text-center">
          <RefreshCw className="w-8 h-8 text-[#064E4A] animate-spin mx-auto" />
        </div>
      }
    >
      <SchemesContent />
    </Suspense>
  );
}
