"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Zap,
  Trash2,
  Construction,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import { NoticeRecord } from "@/lib/db/notices";

export const HomeAnnouncementsSection: React.FC = () => {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notices?limit=4")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setNotices(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getCategoryIcon = (category: string) => {
    if (category.includes("Water")) return Droplets;
    if (category.includes("Electricity")) return Zap;
    if (category.includes("Sanitation") || category.includes("Health")) return Trash2;
    if (category.includes("Road") || category.includes("Works")) return Construction;
    if (category.includes("Emergency")) return AlertTriangle;
    return FileText;
  };

  const getCategoryClass = (category: string) => {
    if (category.includes("Water")) return "bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800";
    if (category.includes("Electricity")) return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    if (category.includes("Sanitation") || category.includes("Health")) return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
    if (category.includes("Road") || category.includes("Works")) return "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800";
    if (category.includes("Emergency")) return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    return "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
  };

  if (loading && notices.length === 0) {
    return null;
  }

  if (notices.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1380px] mx-auto px-4 my-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#064E4A] dark:text-teal-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Official Municipal Bulletins</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            Announcements & Public Gazette
          </h2>
        </div>

        <Link
          href="/notices"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#064E4A] dark:text-teal-400 hover:text-[#0B6B63] dark:hover:text-teal-300 transition group"
        >
          <span>View All Ward Announcements</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {notices.map((n) => {
          const Icon = getCategoryIcon(n.category);
          return (
            <Link
              key={n.id}
              href={`/notices/${n.id}`}
              className={`p-4 rounded-xl border bg-white dark:bg-[#061817] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                n.isEmergency
                  ? "border-rose-300 dark:border-rose-900 bg-rose-50/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-teal-400"
              }`}
            >
              <div className="space-y-2.5">
                {/* Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getCategoryClass(
                      n.category
                    )}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{n.category}</span>
                  </span>

                  {n.isEmergency ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                      EMERGENCY
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                      {n.priority}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {n.title}
                </h3>

                {/* Description snippet */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {n.description}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1 text-[#064E4A] dark:text-teal-400 font-semibold truncate max-w-[140px]">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{n.targetWards || "City-Wide"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(n.publishDate).toLocaleDateString()}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
