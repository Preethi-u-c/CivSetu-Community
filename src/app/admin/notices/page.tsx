"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  Calendar,
  Tag,
  Pin,
  CheckCircle2,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { NoticeRecord } from "@/lib/db/types";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [titleKn, setTitleKn] = useState("");
  const [category, setCategory] = useState("Public Utilities");
  const [categoryKn, setCategoryKn] = useState("ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯ");
  const [content, setContent] = useState("");
  const [contentKn, setContentKn] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notices?all=true");
      const json = await res.json();
      if (json.success) {
        setNotices(json.data);
      }
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          titleKn: titleKn || title,
          category,
          categoryKn: categoryKn || category,
          content,
          contentKn: contentKn || content,
          fileUrl,
          isPinned,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setNotices((prev) => [json.data, ...prev]);
        setShowCreateForm(false);
        // Reset form
        setTitle("");
        setTitleKn("");
        setContent("");
        setContentKn("");
        setFileUrl("");
        setIsPinned(false);
      }
    } catch (err) {
      console.error("Failed to publish notice:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (slug: string) => {
    try {
      const res = await fetch(`/api/notices/${slug}`, { method: "PATCH" });
      const json = await res.json();
      if (json.success) {
        setNotices((prev) =>
          prev.map((item) => (item.slug === slug ? json.data : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  const deleteNotice = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this official gazette notification?")) return;
    try {
      const res = await fetch(`/api/notices/${slug}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setNotices((prev) => prev.filter((item) => item.slug !== slug));
      }
    } catch (err) {
      console.error("Failed to delete notice:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            Municipal Gazette & Notice Publisher
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Publish bilingual public notifications, tender alerts, and civic gazettes to the CivSetu portal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold shadow transition"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showCreateForm ? "Close Form" : "Draft New Notice"}</span>
          </button>
          <button
            onClick={fetchNotices}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notice Draft Form */}
      {showCreateForm && (
        <div className="p-6 rounded-xl border border-teal-200 dark:border-teal-900 bg-white dark:bg-[#061817] shadow-md space-y-4">
          <h2 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
            <span>Publish New Gazette Notice (Bilingual)</span>
          </h2>

          <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Jalashri Kalyana Scheme Ward 1-18 Phase II"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Title (Kannada) *
                </label>
                <input
                  type="text"
                  value={titleKn}
                  onChange={(e) => setTitleKn(e.target.value)}
                  placeholder="ಉದಾ. ಜಲಶ್ರೀ ಕಲ್ಯಾಣ ಯೋಜನೆ ವಾರ್ಡ್ ೧-೧೮ ಹಂತ ೨"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Category (English) *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value === "Water Resources") setCategoryKn("ಜಲ ಸಂಪನ್ಮೂಲ");
                    else if (e.target.value === "Public Utilities") setCategoryKn("ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯ");
                    else if (e.target.value === "Urban Planning") setCategoryKn("ನಗರ ಯೋಜನೆ");
                    else if (e.target.value === "E-Governance") setCategoryKn("ಇ-ಆಡಳಿತ");
                    else if (e.target.value === "Sanitation") setCategoryKn("ನೈರ್ಮಲ್ಯ");
                    else setCategoryKn("ಸಾಮಾನ್ಯ ಅಧಿಸೂಚನೆ");
                  }}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                >
                  <option value="Water Resources">Water Resources</option>
                  <option value="Public Utilities">Public Utilities</option>
                  <option value="Urban Planning">Urban Planning</option>
                  <option value="E-Governance">E-Governance</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="General Notice">General Notice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Category (Kannada)
                </label>
                <input
                  type="text"
                  value={categoryKn}
                  onChange={(e) => setCategoryKn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Detailed Gazette Content (English) *
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter complete notification text in English..."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Detailed Gazette Content (Kannada) *
              </label>
              <textarea
                rows={3}
                value={contentKn}
                onChange={(e) => setContentKn(e.target.value)}
                placeholder="ಕನ್ನಡದಲ್ಲಿ ಅಧಿಸೂಚನೆಯ ವಿವರವಾದ ವಿಷಯವನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ..."
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                required
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Pin to Top of "What's New" Notices
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-md bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold shadow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Publishing..." : "Publish Gazette Notice"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-[#061817] rounded-xl border border-gray-200 dark:border-gray-800">
            No notices found. Click "Draft New Notice" above to publish one.
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border bg-white dark:bg-[#061817] shadow-sm space-y-3 transition ${
                n.isPublished
                  ? "border-gray-200 dark:border-gray-800"
                  : "border-dashed border-gray-300 dark:border-gray-700 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                      ID #{n.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {n.category}
                    </span>
                    {n.isPinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        n.isPublished
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {n.isPublished ? "PUBLISHED" : "UNPUBLISHED"}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{n.title}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{n.titleKn}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(n.slug)}
                    className={`px-3 py-1 rounded text-xs font-semibold border transition ${
                      n.isPublished
                        ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {n.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => deleteNotice(n.slug)}
                    className="p-1.5 rounded text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p className="line-clamp-2">{n.content}</p>
                <p className="line-clamp-2 text-gray-500">{n.contentKn}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Published Date: {n.date}
                  </span>
                  <span>Slug: /{n.slug}</span>
                </div>

                <Link
                  href={`/notices/${n.slug}`}
                  target="_blank"
                  className="text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
