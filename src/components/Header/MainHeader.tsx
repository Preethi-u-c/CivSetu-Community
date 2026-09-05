"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { StateEmblem } from "./StateEmblem";
import { siteConfig } from "@/data/siteConfig";
import { useAccessibility } from "@/context/AccessibilityContext";

export const MainHeader: React.FC = () => {
  const { language } = useAccessibility();
  const isKn = language === "kn";

  return (
    <div className="bg-white dark:bg-[#071d1b] border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-[1380px] mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Karnataka Emblem + CivSetu Brand & Municipality Title */}
        <Link href="/" className="flex items-center gap-3.5 group text-left">
          <StateEmblem className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#064E4A] dark:text-[#2DD4BF] leading-none">
              {siteConfig.name}
            </span>
            <span className="text-sm sm:text-base font-semibold text-[#B98519] dark:text-[#FBBF24] mt-1 tracking-wide">
              {isKn ? siteConfig.municipalityKn : siteConfig.municipality}
            </span>
          </div>
        </Link>

        {/* Right Side: Government Dept & Official Contact Information */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end md:items-end gap-3 text-right">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col text-center sm:text-right">
              <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100">
                {isKn ? siteConfig.stateGovKn : siteConfig.stateGov}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                {isKn ? siteConfig.departmentKn : siteConfig.department}
              </span>
            </div>
            <StateEmblem className="w-9 h-9 flex-shrink-0 hidden sm:block" />
          </div>

          <div className="flex flex-col items-center sm:items-end gap-0.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
            <a
              href={`tel:${siteConfig.contactNumber}`}
              className="flex items-center gap-1.5 hover:text-[#064E4A] dark:hover:text-teal-400 transition"
            >
              <Phone className="w-3.5 h-3.5 text-gray-800 dark:text-gray-200 fill-current" />
              <span>{siteConfig.contactNumber}</span>
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-1.5 hover:text-[#064E4A] dark:hover:text-teal-400 transition"
            >
              <Mail className="w-3.5 h-3.5 text-gray-800 dark:text-gray-200" />
              <span>{siteConfig.email}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
