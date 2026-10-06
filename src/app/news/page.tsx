"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Newspaper,
  Calendar,
  Clock,
  MapPin,
  Search,
  Building,
  ArrowRight,
  RefreshCw,
  Eye,
  User,
  Filter,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { wardsData } from "@/data/wards";
import { useAuth } from "@/context/AuthContext";
import { NewsArticle, NEWS_CATEGORIES } from "@/lib/types/news";
import { useAccessibility } from "@/context/AccessibilityContext";
import { NEWS_TRANSLATIONS, NEWS_CATEGORY_MAP } from "@/data/newsTranslations";

const CATEGORY_FILTERS = [
  "ALL",
  ...NEWS_CATEGORIES,
];

function NewsContent() {
  const { language } = useAccessibility();
  const { citizen, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const urlWard = searchParams?.get("ward") || "";
  const urlCategory = searchParams?.get("category") || "ALL";

  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [selectedWard, setSelectedWard] = useState(urlWard || "ALL");

  // If citizen is logged in and no ward specified in URL, automatically focus on their registered ward
  useEffect(() => {
    if (!urlWard && isAuthenticated && citizen?.wardNumber && selectedWard === "ALL") {
      setSelectedWard(citizen.wardNumber);
    }
  }, [isAuthenticated, citizen, urlWard]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllArticles(json.data);
      }
    } catch (err) {
      console.error("Failed to load news articles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Instant zero-latency filter on category click or search
  const filteredArticles = useMemo(() => {
    return allArticles.filter((a) => {
      if (activeCategory !== "ALL" && a.category !== activeCategory) return false;
      if (selectedWard !== "ALL") {
        const wStr = selectedWard.toLowerCase();
        const tWard = (a.wardRelevance || "").toLowerCase();
        const match = tWard.includes(wStr) || tWard.includes("all wards");
        if (!match) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const inHead = a.headline.toLowerCase().includes(q);
        const inSum = a.summary.toLowerCase().includes(q);
        const inArt = a.article.toLowerCase().includes(q);
        const inWard = (a.wardRelevance || "").toLowerCase().includes(q);
        return inHead || inSum || inArt || inWard;
      }
      return true;
    });
  }, [allArticles, activeCategory, selectedWard, search]);

  const featuredStory = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const remainingStories = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  const isCitizenWardMatch = (wardRelevance: string): boolean => {
    if (!isAuthenticated || !citizen?.wardNumber) return false;
    const cw = citizen.wardNumber.toLowerCase();
    const wr = wardRelevance.toLowerCase();
    return wr.includes(cw) || (cw.includes("ward ") && wr.includes(cw.replace("ward ", "ward 0")));
  };

  return (
    <div className="max-w-[1380px] mx-auto px-4 py-6 space-y-8">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
            <Newspaper className="w-4 h-4" />
            <span>
              {language === "kn"
                ? "ಲಕ್ಷ್ಮೇಶ್ವರ ಗೆಜೆಟ್ • ಸ್ಥಳೀಯ ಸುದ್ದಿ ಮತ್ತು ಸಮುದಾಯ ಪತ್ರಿಕೋದ್ಯಮ"
                : language === "hi"
                ? "लक्ष्मेश्वर राजपत्र • स्थानीय समाचार एवं सामुदायिक पत्रकारिता"
                : "Lakshmeshwar Gazette • Local News & Community Journalism"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === "kn"
              ? "ನಗರದ ಸುದ್ದಿಗಳು ಮತ್ತು ನಾಗರಿಕ ಬೆಳವಣಿಗೆಗಳು"
              : language === "hi"
              ? "नगर समाचार एवं नागरिक विकास"
              : "Town News & Civic Developments"}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {language === "kn"
              ? "ಪರಿಶೀಲಿಸಿದ ಪುರಸಭೆ ವರದಿಗಳು, ಬಡಾವಣೆ ಸಾಧನೆಗಳು, ಅಭಿವೃದ್ಧಿ ಯೋಜನಾ ಟ್ರ್ಯಾಕರ್, ಸಾಂಸ್ಕೃತಿಕ ಮುಖ್ಯಾಂಶಗಳು ಮತ್ತು ಸಮುದಾಯದ ಕಥೆಗಳು."
              : language === "hi"
              ? "सत्यापित नगर पालिका रिपोर्टिंग, मोहल्ला उपलब्धियां, विकास परियोजना ट्रैकर, सांस्कृतिक झलकियां और सामुदायिक समाचार।"
              : "Verified municipal reporting, neighborhood milestones, developmental project trackers, cultural highlights, and community stories across Lakshmeshwar."}
          </p>
        </div>
      </div>

      {/* Citizen Personalization Banner */}
      {isAuthenticated && citizen && (
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#064E4A] text-white flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                  {language === "kn" ? "ಸುಸ್ವಾಗತ," : language === "hi" ? "स्वागत है," : "Welcome,"} {citizen.fullName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#064E4A] text-white">
                  {citizen.wardNumber}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {language === "kn"
                  ? "ನಿಮ್ಮ ವಾರ್ಡ್‌ಗೆ ಸಂಬಂಧಿಸಿದ ಸ್ಥಳೀಯ ಸುದ್ದಿಗಳು ಮತ್ತು ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ."
                  : language === "hi"
                  ? "आपके वार्ड से जुड़े स्थानीय समाचार और विकास परियोजनाएं आपके लिए टैग की गई हैं।"
                  : "Local stories and developmental projects impacting your ward are tagged for you."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedWard !== citizen.wardNumber ? (
              <button
                onClick={() => setSelectedWard(citizen.wardNumber)}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#064E4A] text-white text-xs font-bold shadow-sm hover:bg-[#0B6B63] transition flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{language === "kn" ? `${citizen.wardNumber} ಸುದ್ದಿಗಳು` : language === "hi" ? `${citizen.wardNumber} समाचार` : `Show Stories for ${citizen.wardNumber}`}</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedWard("ALL")}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
              >
                {language === "kn" ? "ಸಮಗ್ರ ಪುರಸಭೆ ವೀಕ್ಷಿಸಿ" : language === "hi" ? "संपूर्ण नगर पालिका देखें" : "Show All Municipality"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = activeCategory === cat;
          const label = language === "kn"
            ? (NEWS_CATEGORY_MAP[cat]?.kn || cat)
            : language === "hi"
            ? (NEWS_CATEGORY_MAP[cat]?.hi || cat)
            : cat === "ALL" ? "All Categories" : cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-[#064E4A] text-white border-[#064E4A] shadow-sm"
                  : "bg-white dark:bg-[#061817] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search & Ward Selector Filter Bar */}
      <div className="bg-white dark:bg-[#061817] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "kn"
                  ? "ಸುದ್ದಿಗಳನ್ನು ಹುಡುಕಿ (ಉದಾ: ಕುಡಿಯುವ ನೀರು, ಸೋಮೇಶ್ವರ ದೇಗುಲ, ಸ್ವಚ್ಛ ಭಾರತ)..."
                  : language === "hi"
                  ? "समाचार खोजें (उदा: जल परियोजना, सोमेश्वर मंदिर, स्वच्छ भारत)..."
                  : "Search news stories (e.g. water project, temple, Swachh Bharat)..."
              }
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Ward Relevance Dropdown */}
          <div className="sm:col-span-5 relative">
            <div className="flex items-center">
              <span className="absolute left-3 text-gray-400 pointer-events-none">
                <MapPin className="w-4 h-4" />
              </span>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600 font-semibold"
              >
                <option value="ALL">All Wards & City-Wide</option>
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
        </div>

        {selectedWard !== "ALL" && (
          <div className="text-[11px] text-[#064E4A] dark:text-teal-400 font-medium flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              Showing news stories with relevance to <strong>{selectedWard}</strong> and city-wide civic developments.
            </span>
            <button
              onClick={() => setSelectedWard("ALL")}
              className="ml-2 text-gray-400 hover:text-gray-600 underline"
            >
              Clear Ward Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-[#061817] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-xs text-gray-500">Loading verified town news...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#061817] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
          <Newspaper className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">
            No News Articles Found
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            No published stories matched your filter criteria. Try resetting the category or ward filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("ALL");
              setSelectedWard("ALL");
            }}
            className="px-4 py-2 rounded-lg bg-[#064E4A] text-white text-xs font-bold shadow hover:bg-[#0B6B63] transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Headline Story */}
          {featuredStory && (() => {
            const locFeat = language === "kn" 
              ? NEWS_TRANSLATIONS[featuredStory.id]?.kn 
              : language === "hi" 
              ? NEWS_TRANSLATIONS[featuredStory.id]?.hi 
              : null;

            const featTitle = locFeat?.headline || featuredStory.headline;
            const featSummary = locFeat?.summary || featuredStory.summary;
            const featCat = locFeat?.category || (NEWS_CATEGORY_MAP[featuredStory.category]?.[language as "kn" | "hi"] || featuredStory.category);
            const featAuthor = locFeat?.authorName || featuredStory.authorName;

            return (
              <article className="bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Image */}
                  <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-[260px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={featuredStory.imageUrl}
                      alt={featTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#064E4A] text-white shadow">
                        {language === "kn" ? "ವಿಶೇಷ ವರದಿ" : language === "hi" ? "विशेष रिपोर्ट" : "Featured Story"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 backdrop-blur shadow">
                        {featCat}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{featuredStory.wardRelevance}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(featuredStory.publishedAt).toLocaleDateString(language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{featuredStory.readTimeMinutes} {language === "kn" ? "ನಿಮಿಷ ಓದು" : language === "hi" ? "मिनट वाचन" : "min read"}</span>
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                        <Link href={`/news/${featuredStory.id}`}>
                          {featTitle}
                        </Link>
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {featSummary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {language === "kn" ? "ಲೇಖಕರು:" : language === "hi" ? "द्वारा:" : "By"}{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{featAuthor}</span>
                      </div>

                      <Link
                        href={`/news/${featuredStory.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold shadow-sm transition"
                      >
                        <span>{language === "kn" ? "ಸುದ್ದಿ ಓದಿ" : language === "hi" ? "समाचार पढ़ें" : "Read Story"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })()}

          {/* Remaining Stories Grid */}
          {remainingStories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {language === "kn" ? "ಹೆಚ್ಚಿನ ಸಮುದಾಯ ಮತ್ತು ಪುರಸಭೆ ಸುದ್ದಿಗಳು" : language === "hi" ? "अन्य सामुदायिक एवं नागरिक समाचार" : "More Community & Civic News"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingStories.map((article) => {
                  const isCitizenWard = isCitizenWardMatch(article.wardRelevance);
                  const locArt = language === "kn" 
                    ? NEWS_TRANSLATIONS[article.id]?.kn 
                    : language === "hi" 
                    ? NEWS_TRANSLATIONS[article.id]?.hi 
                    : null;

                  const artTitle = locArt?.headline || article.headline;
                  const artSummary = locArt?.summary || article.summary;
                  const artCat = locArt?.category || (NEWS_CATEGORY_MAP[article.category]?.[language as "kn" | "hi"] || article.category);
                  const artAuthor = locArt?.authorName || article.authorName;

                  return (
                    <article
                      key={article.id}
                      className="bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div>
                        {/* Article Image */}
                        <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={artTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064E4A] text-white shadow-sm">
                              {artCat}
                            </span>
                            {isCitizenWard && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{language === "kn" ? "ನಿಮ್ಮ ವಾರ್ಡ್" : language === "hi" ? "आपका वार्ड" : "Your Ward"}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Article Text Content */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span>{article.wardRelevance}</span>
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(article.publishedAt).toLocaleDateString(language === "kn" ? "kn-IN" : language === "hi" ? "hi-IN" : "en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span>{article.readTimeMinutes} {language === "kn" ? "ನಿಮಿಷ" : language === "hi" ? "मिनट" : "min"}</span>
                          </div>

                          <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition line-clamp-2">
                            <Link href={`/news/${article.id}`}>
                              {artTitle}
                            </Link>
                          </h3>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {artSummary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800/80 mt-2 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-400 truncate max-w-[130px]">
                          {artAuthor}
                        </span>

                        <Link
                          href={`/news/${article.id}`}
                          className="font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <span>{language === "kn" ? "ಪೂರ್ಣ ಸುದ್ದಿ" : language === "hi" ? "पूरी खबर" : "Full Story"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Citizen Submission / Community Journalism Notice */}
      <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100">
            Have a neighborhood achievement, civic story, or cultural milestone to share?
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            CivSetu publishes verified community news and developmental achievements across all 23 wards of Lakshmeshwar.
          </p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs sm:text-sm font-bold shadow transition whitespace-nowrap"
        >
          Contact News Desk →
        </Link>
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1380px] mx-auto p-12 text-center text-xs text-gray-500">
          Loading Lakshmeshwar community news...
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}
