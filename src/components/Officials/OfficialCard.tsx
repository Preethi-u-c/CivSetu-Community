"use client";

import React from "react";
import Link from "next/link";
import { Official } from "@/data/officials";
import { useAccessibility } from "@/context/AccessibilityContext";

interface OfficialCardProps {
  official: Official;
  index: number;
}

export const OfficialCard: React.FC<OfficialCardProps> = ({ official, index }) => {
  const { language } = useAccessibility();
  const isKn = language === "kn";

  // Shirt colors reflecting the reference image:
  // index 0 (D.K. Shivakumar): White kurta
  // index 1 (M.C. Sudhakar): Sky blue shirt
  // index 2 (Sarangappa M): Tan/Khaki safari shirt
  // index 3 (Purushottam Gudadinni): Royal blue shirt
  const shirtFills = ["#FFFFFF", "#38BDF8", "#A88352", "#1D4ED8"];
  const tieOrCollar = ["#E5E7EB", "#0284C7", "#785324", "#1E40AF"];

  return (
    <Link
      href={`/officials/${official.slug}`}
      className="group block bg-white dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-[#064E4A]/40 transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Official Portrait Avatar Container */}
        <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 flex-shrink-0 shadow-inner flex items-center justify-center">
          {/* Vector representation reflecting real posture and attire from reference */}
          <svg
            viewBox="0 0 80 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            role="img"
            aria-label={official.name}
          >
            {/* Soft Studio Backdrop */}
            <rect width="80" height="100" fill="#E2E8F0" />
            <circle cx="40" cy="35" r="30" fill="#CBD5E1" opacity="0.6" />

            {/* Shoulders & Attire */}
            <path
              d="M10 95 C 15 72, 65 72, 70 95 Z"
              fill={shirtFills[index] || "#FFFFFF"}
              stroke="#64748B"
              strokeWidth="1"
            />
            {/* Collar Detail */}
            <path
              d="M32 72 L40 85 L48 72 Z"
              fill={tieOrCollar[index] || "#CBD5E1"}
            />

            {/* Neck */}
            <rect x="34" y="55" width="12" height="18" fill="#D97706" opacity="0.4" rx="2" />

            {/* Head Silhouette */}
            <ellipse cx="40" cy="42" rx="15" ry="18" fill="#FBBF24" opacity="0.75" />

            {/* Hair */}
            <path
              d="M25 38 C 25 24, 55 24, 55 38 C 50 32, 30 32, 25 38 Z"
              fill="#1E293B"
            />
            {/* Mustache */}
            <path
              d="M34 49 C 37 47, 43 47, 46 49 C 43 51, 37 51, 34 49 Z"
              fill="#1E293B"
            />

            {/* Spectacles for Administrator if applicable */}
            {index === 2 && (
              <g stroke="#334155" strokeWidth="1.2" fill="none">
                <rect x="29" y="38" width="9" height="7" rx="1.5" />
                <rect x="42" y="38" width="9" height="7" rx="1.5" />
                <line x1="38" y1="41" x2="42" y2="41" />
              </g>
            )}
          </svg>
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
