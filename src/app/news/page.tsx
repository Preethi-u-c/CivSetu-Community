"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
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

const CATEGORY_FILTERS = [
  "ALL",
  ...NEWS_CATEGORIES,
];

function NewsContent() {
  const { citizen, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const urlWard = searchParams?.get("ward") || "";
  const urlCategory = searchParams?.get("category") || "ALL";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
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
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") params.set("category", activeCategory);
      if (selectedWard !== "ALL") params.set("ward", selectedWard);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/news?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArticles(json.data);
      }
    } catch (err) {
      console.error("Failed to load news articles:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedWard, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const featuredStory = articles.length > 0 ? articles[0] : null;
  const remainingStories = articles.length > 1 ? articles.slice(1) : [];

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
            <span>Lakshmeshwar Gazette • Local News & Community Journalism</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Town News & Civic Developments
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Verified municipal reporting, neighborhood milestones, developmental project trackers, cultural highlights, and community stories across Lakshmeshwar.
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
                  Welcome, {citizen.fullName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#064E4A] text-white">
                  {citizen.wardNumber}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Local stories and developmental projects impacting your ward are tagged for you.
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
                <span>Show Stories for {citizen.wardNumber}</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedWard("ALL")}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 transition"
              >
                Show All Municipality
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = activeCategory === cat;
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
              {cat === "ALL" ? "All Categories" : cat}
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
              placeholder="Search news stories (e.g. water project, temple, Swachh Bharat)..."
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
      ) : articles.length === 0 ? (
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
          {featuredStory && (
            <article className="bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Image */}
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-[260px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={featuredStory.imageUrl}
                    alt={featuredStory.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#064E4A] text-white shadow">
                      Featured Story
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 backdrop-blur shadow">
                      {featuredStory.category}
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
                          {new Date(featuredStory.publishedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredStory.readTimeMinutes} min read</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                      <Link href={`/news/${featuredStory.id}`}>
                        {featuredStory.headline}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {featuredStory.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      By <span className="font-semibold text-gray-700 dark:text-gray-300">{featuredStory.authorName}</span>
                    </div>

                    <Link
                      href={`/news/${featuredStory.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold shadow-sm transition"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Remaining Stories Grid */}
          {remainingStories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                More Community & Civic News
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingStories.map((article) => {
                  const isCitizenWard = isCitizenWardMatch(article.wardRelevance);

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
                            alt={article.headline}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064E4A] text-white shadow-sm">
                              {article.category}
                            </span>
                            {isCitizenWard && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Your Ward</span>
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
                              {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            <span>{article.readTimeMinutes} min</span>
                          </div>

                          <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition line-clamp-2">
                            <Link href={`/news/${article.id}`}>
                              {article.headline}
                            </Link>
                          </h3>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800/80 mt-2 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-400 truncate max-w-[130px]">
                          {article.authorName}
                        </span>

                        <Link
                          href={`/news/${article.id}`}
                          className="font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <span>Full Story</span>
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
