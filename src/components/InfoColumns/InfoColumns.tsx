"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { notices as defaultNotices } from "@/data/notices";
import { useAccessibility } from "@/context/AccessibilityContext";

export const InfoColumns: React.FC = () => {
  const { t, language } = useAccessibility();
  const isKn = language === "kn";

  const [stats, setStats] = useState(siteConfig.visitorStats);
  const [noticesList, setNoticesList] = useState(defaultNotices);

  useEffect(() => {
    // Record visit
    fetch("/api/stats/visit", { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats((prev) => ({
            ...prev,
            totalVisitors: json.data.totalVisitors,
            uniqueVisitors: json.data.uniqueVisitors,
          }));
        }
      })
      .catch(() => {});

    // Fetch live stats & notices
    fetch("/api/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.visitorStats) {
          setStats(json.data.visitorStats);
        }
      })
      .catch(() => {});

    fetch("/api/notices")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setNoticesList(json.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#F4F8F7] dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
        {/* Column 1: Visitors */}
        <div className="flex flex-col pr-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
            {t.info.visitors}
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-800 dark:text-gray-300">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.totalVisitors} :</span>
              <span className="font-bold">{stats.totalVisitors}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.uniqueVisitors} :</span>
              <span className="font-bold">{stats.uniqueVisitors}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.registeredUsers} :</span>
              <span className="font-bold">{stats.registeredUsers}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.lastRegisteredUser} :</span>
              <span className="text-teal-700 dark:text-teal-400 font-semibold truncate">
                {stats.lastRegisteredUser}
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.publishedNotice} :</span>
              <span className="font-bold">{stats.publishedNotices}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.yourIp} :</span>
              <span className="text-gray-600 dark:text-gray-400 font-mono text-[11px]">
                {stats.ipPlaceholder}
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-gray-400" />
              <span className="font-medium">{t.info.since} :</span>
              <span className="text-gray-600 dark:text-gray-400 text-[11px]">
                {stats.sinceDate}
              </span>
            </li>
          </ul>
        </div>

        {/* Column 2: What's New */}
        <div className="flex flex-col px-0 md:px-3 pt-4 md:pt-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
            {t.info.whatsNew}
          </h3>
          <ul className="space-y-2.5 text-xs">
            {noticesList.map((notice) => (
              <li key={notice.id} className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
                <div className="flex flex-col">
                  <Link
                    href={`/notices/${notice.slug}`}
                    className="font-semibold text-teal-800 dark:text-teal-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {isKn ? notice.titleKn : notice.title}
                  </Link>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isKn ? notice.relativeTimeKn : notice.relativeTime}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Us */}
        <div className="flex flex-col pl-0 md:pl-3 pt-4 md:pt-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 text-center mb-3">
            {t.info.contactUs}
          </h3>
          <div className="text-xs text-gray-800 dark:text-gray-300 space-y-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {isKn ? siteConfig.municipalityKn : siteConfig.municipality}
            </p>
            <p>{siteConfig.address.line1}</p>
            <p>{siteConfig.address.city}</p>
            <p>
              {siteConfig.address.district} Dist., {siteConfig.address.state} - {siteConfig.address.pincode}
            </p>
            <p className="pt-1">
              <span className="font-semibold">Contact Number :</span>{" "}
              <a
                href={`tel:${siteConfig.contactNumberAlt}`}
                className="font-bold hover:text-teal-700"
              >
                {siteConfig.contactNumberAlt}
              </a>
            </p>
            <p>
              <span className="font-semibold">Email :</span>{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-teal-800 dark:text-teal-400 hover:underline"
              >
                {siteConfig.email}
              </a>
            </p>
            <p className="pt-2">
              <span className="font-semibold">{t.info.releaseVersion} </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {siteConfig.releaseVersion}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
