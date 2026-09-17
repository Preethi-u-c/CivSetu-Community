"use client";

import React from "react";
import Link from "next/link";
import { Official } from "@/data/officials";
import { useAccessibility } from "@/context/AccessibilityContext";

interface OfficialCardProps {
  official: Official;
  index: number;
}

export const OfficialCard: React.FC<OfficialCardProps> = ({
  official,
  index,
}) => {
  const { language } = useAccessibility();
  const isKn = language === "kn";

  return (
    <Link
      href={`/officials/${official.slug}`}
      className="group block bg-white dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-[#064E4A]/40 transition-all"
    >
      <div className="flex items-center gap-3">

        {/* Official Real Photograph */}
        <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 flex-shrink-0 shadow-inner">
          <img
            src={official.image}
            alt={official.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Official Details */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[#064E4A] dark:text-[#2DD4BF] group-hover:text-[#B98519] transition-colors leading-tight">
            {isKn ? official.nameKn : official.name}
          </h2>

          <p className="text-[12px] font-normal text-gray-800 dark:text-gray-300 mt-1.5 leading-snug">
            {isKn ? official.designationKn : official.designation}
          </p>

          <p className="text-[11px] font-normal text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
            {isKn ? official.departmentKn : official.department}
          </p>
        </div>

      </div>
    </Link>
  );
};