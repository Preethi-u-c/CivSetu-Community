"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Newspaper,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Send,
  Eye,
  EyeOff,
  User,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";
import { wardsData } from "@/data/wards";
import { NewsArticle, NewsStats, NEWS_CATEGORIES, DEFAULT_NEWS_IMAGE } from "@/lib/types/news";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<NewsStats>({
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Published" | "Draft">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active item for Edit/Delete
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Form State
  const [formHeadline, setFormHeadline] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategory, setFormCategory] = useState<string>(NEWS_CATEGORIES[0]);
  const [formWardScope, setFormWardScope] = useState<"All Wards" | "Entire Municipality" | "Specific Wards">("All Wards");
  const [formSelectedWards, setFormSelectedWards] = useState<number[]>([]);
  const [formSummary, setFormSummary] = useState("");
  const [formArticle, setFormArticle] = useState("");
  const [formAuthorName, setFormAuthorName] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (wardFilter !== "ALL") params.set("ward", wardFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/news?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      if (json.success) {
        setArticles(json.data);
        setTotal(json.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load admin news articles:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, wardFilter, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const resetForm = () => {
    setFormHeadline("");
    setFormImageUrl("");
    setFormCategory(NEWS_CATEGORIES[0]);
    setFormWardScope("All Wards");
    setFormSelectedWards([]);
    setFormSummary("");
    setFormArticle("");
    setFormAuthorName("");
    setFormIsPublished(true);
    setActionError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const openEditModal = (item: NewsArticle) => {
    setSelectedArticle(item);
    setFormHeadline(item.headline);
    setFormImageUrl(item.imageUrl);
    setFormCategory(item.category);
    setFormSummary(item.summary);
    setFormArticle(item.article);
    setFormAuthorName(item.authorName);
    setFormIsPublished(item.isPublished);

    if (item.wardRelevance === "All Wards") {
      setFormWardScope("All Wards");
      setFormSelectedWards([]);
    } else if (item.wardRelevance === "Entire Municipality") {
      setFormWardScope("Entire Municipality");
      setFormSelectedWards([]);
    } else {
      setFormWardScope("Specific Wards");
      // Extract ward numbers
      const matches = item.wardRelevance.match(/\d+/g) || [];
      setFormSelectedWards(matches.map((m) => parseInt(m, 10)));
    }

    setActionError(null);
    setEditModalOpen(true);
  };

  const openDeleteModal = (item: NewsArticle) => {
    setSelectedArticle(item);
    setActionError(null);
    setDeleteModalOpen(true);
  };

  const getWardRelevanceString = (): string => {
    if (formWardScope === "All Wards") return "All Wards";
    if (formWardScope === "Entire Municipality") return "Entire Municipality";
    if (formSelectedWards.length === 0) return "All Wards";
    const sorted = [...formSelectedWards].sort((a, b) => a - b);
    return sorted.map((w) => `Ward ${String(w).padStart(2, "0")}`).join(", ");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHeadline.trim() || !formSummary.trim() || !formArticle.trim()) {
      setActionError("Headline, summary, and article body are required.");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const payload = {
        headline: formHeadline.trim(),
        imageUrl: formImageUrl.trim() || DEFAULT_NEWS_IMAGE,
        category: formCategory,
        wardRelevance: getWardRelevanceString(),
        summary: formSummary.trim(),
        article: formArticle.trim(),
        authorName: formAuthorName.trim() || undefined,
        isPublished: formIsPublished,
      };

      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create news article.");
      }

      setCreateModalOpen(false);
      resetForm();
      fetchArticles();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error creating article.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    if (!formHeadline.trim() || !formSummary.trim() || !formArticle.trim()) {
      setActionError("Headline, summary, and article body are required.");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const payload = {
        headline: formHeadline.trim(),
        imageUrl: formImageUrl.trim() || DEFAULT_NEWS_IMAGE,
        category: formCategory,
        wardRelevance: getWardRelevanceString(),
        summary: formSummary.trim(),
        article: formArticle.trim(),
        authorName: formAuthorName.trim() || undefined,
        isPublished: formIsPublished,
      };

      const res = await fetch(`/api/admin/news/${selectedArticle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update news article.");
      }

      setEditModalOpen(false);
      setSelectedArticle(null);
      resetForm();
      fetchArticles();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error updating article.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: NewsArticle) => {
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ togglePublish: true }),
      });
      const json = await res.json();
      if (json.success) {
        fetchArticles();
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedArticle) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/news/${selectedArticle.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete article.");
      }
      setDeleteModalOpen(false);
      setSelectedArticle(null);
      fetchArticles();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error deleting article.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleWardSelection = (wardNum: number) => {
    setFormSelectedWards((prev) =>
      prev.includes(wardNum) ? prev.filter((w) => w !== wardNum) : [...prev, wardNum]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-[#064E4A] p-6 rounded-2xl text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Newspaper className="w-4 h-4" />
            <span>Lakshmeshwar TMC Municipal Portal</span>
          </div>
          <h1 className="text-2xl font-black">Local News & Community Journalism</h1>
          <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl">
            Publish verified town news, civic project milestones, environmental initiatives, and cultural reports targeted by municipal wards.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold rounded-xl text-xs sm:text-sm transition shadow-sm self-start sm:self-center whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Write News Article</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Articles</span>
            <Newspaper className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600">{stats.published}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Drafts / Unpublished</span>
            <EyeOff className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600">{stats.drafts}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600">Citizen Readers</span>
            <Eye className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-indigo-600">{stats.totalViews}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#071d1b] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search headline, summary, or author..."
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "Published" | "Draft")}
              className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published Live</option>
              <option value="Draft">Draft Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="ALL">All Categories</option>
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ward Relevance Filter */}
          <div className="sm:col-span-2">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 font-semibold"
            >
              <option value="ALL">All Wards</option>
              {wardsData.map((w) => (
                <option key={w.wardNumber} value={`Ward ${String(w.wardNumber).padStart(2, "0")}`}>
                  Ward {w.wardNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Management Table / List */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs text-gray-500">Loading local news registry...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center space-y-3 p-4">
            <Newspaper className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-gray-700 dark:text-gray-300">
              No News Articles Found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are no articles matching your filter parameters. Try clearing your filters or create a new story.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#064E4A] text-white text-xs font-bold rounded-lg shadow hover:bg-[#0B6B63] transition"
            >
              Create First Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Article Details</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Ward Relevance</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Views</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {articles.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    {/* Title & Image */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        />
                        <div className="space-y-1">
                          <Link
                            href={`/news/${item.id}`}
                            target="_blank"
                            className="font-bold text-gray-900 dark:text-gray-100 hover:text-teal-700 line-clamp-1 flex items-center gap-1"
                          >
                            <span>{item.headline}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </Link>
                          <p className="text-xs text-gray-500 line-clamp-1">{item.summary}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>ID: #{item.id}</span>
                            <span>•</span>
                            <span>
                              {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Ward Relevance */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 dark:text-teal-300">
                        <MapPin className="w-3 h-3 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                        <span className="line-clamp-1">{item.wardRelevance}</span>
                      </span>
                    </td>

                    {/* Status & Publish Toggle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-xs ${
                          item.isPublished
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                        }`}
                        title="Click to toggle published / draft state"
                      >
                        {item.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-600" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Views Count */}
                    <td className="py-3 px-4 text-center font-mono font-semibold text-gray-600 dark:text-gray-300">
                      {item.viewsCount}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          title="Edit Article"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE ARTICLE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[#064E4A] dark:text-teal-400">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                    Write Local News Article
                  </h3>
                  <p className="text-xs text-gray-500">
                    Publish civic journalism and community stories to CivSetu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Headline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formHeadline}
                  onChange={(e) => setFormHeadline(e.target.value)}
                  placeholder="e.g. TMC Inaugurates Renovated Hospital Ward in Fort Area"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600 font-bold"
                />
              </div>

              {/* Category & Ward Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 font-semibold"
                  >
                    {NEWS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Ward Relevance Scope <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formWardScope}
                    onChange={(e) =>
                      setFormWardScope(
                        e.target.value as "All Wards" | "Entire Municipality" | "Specific Wards"
                      )
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 font-semibold"
                  >
                    <option value="All Wards">All Wards (Municipality-Wide)</option>
                    <option value="Entire Municipality">Entire Municipality</option>
                    <option value="Specific Wards">Specific Ward(s)</option>
                  </select>
                </div>
              </div>

              {/* Specific Ward Multi-selector if selected */}
              {formWardScope === "Specific Wards" && (
                <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Select Relevant Wards (Wards 01 - 23):
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {wardsData.map((w) => {
                      const isSelected = formSelectedWards.includes(w.wardNumber);
                      return (
                        <button
                          key={w.wardNumber}
                          type="button"
                          onClick={() => toggleWardSelection(w.wardNumber)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                            isSelected
                              ? "bg-[#064E4A] text-white border-[#064E4A]"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          W-{String(w.wardNumber).padStart(2, "0")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Image URL & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                  <p className="text-[10px] text-gray-400">Leave empty to use official TMC civic default image</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Author / Desk Name
                  </label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    placeholder="CivSetu News Desk"
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Summary / Lead Paragraph <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="2-3 sentence overview of the news story..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Full Article Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Full Article Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formArticle}
                  onChange={(e) => setFormArticle(e.target.value)}
                  placeholder="Full article text, reporting details, quotes, and background..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Publication Status Toggle */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="font-bold text-xs text-gray-900 dark:text-gray-100 block">
                    Publish Immediately
                  </span>
                  <span className="text-[11px] text-gray-500">
                    If enabled, this article will appear live on /news immediately.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-5 h-5 rounded text-[#064E4A] focus:ring-teal-500 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{formIsPublished ? "Publish Article" : "Save as Draft"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ARTICLE MODAL */}
      {editModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[#064E4A] dark:text-teal-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                    Edit News Article #{selectedArticle.id}
                  </h3>
                  <p className="text-xs text-gray-500">Update story details, image, or ward relevance</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Headline</label>
                <input
                  type="text"
                  required
                  value={formHeadline}
                  onChange={(e) => setFormHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    {NEWS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Ward Relevance</label>
                  <select
                    value={formWardScope}
                    onChange={(e) =>
                      setFormWardScope(
                        e.target.value as "All Wards" | "Entire Municipality" | "Specific Wards"
                      )
                    }
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="All Wards">All Wards (Municipality-Wide)</option>
                    <option value="Entire Municipality">Entire Municipality</option>
                    <option value="Specific Wards">Specific Ward(s)</option>
                  </select>
                </div>
              </div>

              {formWardScope === "Specific Wards" && (
                <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Select Relevant Wards:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {wardsData.map((w) => {
                      const isSelected = formSelectedWards.includes(w.wardNumber);
                      return (
                        <button
                          key={w.wardNumber}
                          type="button"
                          onClick={() => toggleWardSelection(w.wardNumber)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                            isSelected
                              ? "bg-[#064E4A] text-white border-[#064E4A]"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          W-{String(w.wardNumber).padStart(2, "0")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Image URL</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Author</label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Summary</label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Article Body</label>
                <textarea
                  required
                  rows={6}
                  value={formArticle}
                  onChange={(e) => setFormArticle(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="font-bold text-xs text-gray-900 dark:text-gray-100 block">
                    Published Live Status
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Control visibility of this article on the public /news feed
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-5 h-5 rounded text-[#064E4A] focus:ring-teal-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                Delete News Article?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete article{" "}
              <strong>&ldquo;{selectedArticle.headline}&rdquo;</strong> (#{selectedArticle.id})? This action cannot be undone.
            </p>

            {actionError && (
              <p className="text-xs text-red-600 font-semibold">{actionError}</p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
