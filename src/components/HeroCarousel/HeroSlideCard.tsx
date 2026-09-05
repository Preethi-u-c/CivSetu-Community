"use client";

import React from "react";
import Image from "next/image";
import { HeroSlide } from "@/data/heroSlides";

interface HeroSlideCardProps {
  slide: HeroSlide;
  index: number;
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({ slide, index }) => {
  // Renders either the image if loaded or a rich architectural graphic fallback matching the reference
  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[390px] overflow-hidden group bg-gray-900 select-none">
      {/* Visual illustration / photographic scenery */}
      <div className="absolute inset-0 w-full h-full">
        {index === 0 && (
          // Scene 1: Colorful Gopuram
          <div className="w-full h-full bg-gradient-to-b from-[#60A5FA] via-[#93C5FD] to-[#D97706] relative overflow-hidden flex flex-col justify-end">
            {/* Sky and sun */}
            <div className="absolute top-6 right-8 w-14 h-14 rounded-full bg-amber-100 blur-[1px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/50 via-sky-600/30 to-transparent" />
            {/* Colorful Stepped Gopuram Structure */}
            <div className="relative mx-auto w-[65%] max-w-[240px] h-[85%] flex flex-col items-center justify-end">
              {/* Kalash Spire */}
              <div className="w-4 h-8 bg-amber-400 rounded-t-full shadow-md z-10" />
              {/* Tier 5 */}
              <div className="w-[50%] h-10 bg-[#E11D48] border border-amber-300 rounded-t-sm flex items-center justify-around px-1">
                <span className="w-2 h-4 bg-amber-300 rounded-full" />
                <span className="w-2 h-4 bg-teal-300 rounded-full" />
                <span className="w-2 h-4 bg-amber-300 rounded-full" />
              </div>
              {/* Tier 4 */}
              <div className="w-[65%] h-12 bg-[#0284C7] border border-amber-300 flex items-center justify-around px-2">
                <span className="w-3 h-5 bg-amber-300 rounded-sm" />
                <span className="w-3 h-5 bg-emerald-400 rounded-sm" />
                <span className="w-3 h-5 bg-amber-300 rounded-sm" />
              </div>
              {/* Tier 3 */}
              <div className="w-[80%] h-14 bg-[#D97706] border border-amber-200 flex items-center justify-around px-2">
                <span className="w-3 h-6 bg-red-500 rounded-sm" />
                <span className="w-3 h-6 bg-sky-300 rounded-sm" />
                <span className="w-3 h-6 bg-emerald-300 rounded-sm" />
              </div>
              {/* Tier 2 */}
              <div className="w-[92%] h-16 bg-[#059669] border border-amber-200 flex items-center justify-around px-3">
                <span className="w-4 h-8 bg-amber-300 rounded-sm" />
                <span className="w-4 h-8 bg-red-600 rounded-sm" />
                <span className="w-4 h-8 bg-sky-400 rounded-sm" />
              </div>
              {/* Stone Base Entrance */}
              <div className="w-full h-24 bg-[#78716C] border-t-2 border-stone-800 flex items-end justify-center relative shadow-lg">
                <div className="w-14 h-16 bg-stone-950 rounded-t-full border border-stone-600" />
              </div>
            </div>
          </div>
        )}

        {index === 1 && (
          // Scene 2: Ancient Carved Stone Temple
          <div className="w-full h-full bg-gradient-to-b from-[#78350F]/70 via-[#92400E]/40 to-[#451A03] relative overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-[#A8A29E]/30" />
            <div className="relative mx-auto w-[85%] h-[80%] flex flex-col items-center justify-end">
              {/* Temple Shikara */}
              <div className="w-24 h-28 bg-[#78716C] rounded-t-lg border-2 border-[#57534E] shadow-inner flex flex-col items-center justify-around p-1">
                <div className="w-16 h-4 bg-[#57534E] rounded" />
                <div className="w-18 h-4 bg-[#57534E] rounded" />
                <div className="w-20 h-4 bg-[#57534E] rounded" />
              </div>
              {/* Stone Pillared Mandapa */}
              <div className="w-full h-36 bg-[#A8A29E] border-2 border-[#78716C] flex items-end justify-around px-4 shadow-xl">
                <div className="w-4 h-28 bg-[#57534E]" />
                <div className="w-4 h-28 bg-[#57534E]" />
                <div className="w-8 h-20 bg-stone-900 rounded-t-sm" />
                <div className="w-4 h-28 bg-[#57534E]" />
                <div className="w-4 h-28 bg-[#57534E]" />
              </div>
              {/* Stone Courtyard Floor */}
              <div className="w-full h-10 bg-[#57534E] border-t border-stone-400" />
            </div>
          </div>
        )}

        {index === 2 && (
          // Scene 3: Temple Shikhara & Spire
          <div className="w-full h-full bg-gradient-to-b from-sky-300 via-stone-300 to-stone-700 relative overflow-hidden flex flex-col justify-end">
            <div className="relative mx-auto w-[75%] h-[90%] flex flex-col items-center justify-end">
              {/* Amalaka and Kalasha Top */}
              <div className="w-6 h-6 bg-amber-600 rounded-full border-2 border-stone-800" />
              <div className="w-16 h-6 bg-[#57534E] rounded-full border border-stone-800" />
              {/* Stepped Horizontal tiers */}
              {[90, 82, 74, 66, 58, 50, 42, 34].reverse().map((widthPct, i) => (
                <div
                  key={i}
                  style={{ width: `${widthPct}%` }}
                  className="h-6 bg-[#78716C] border border-[#44403C] flex items-center justify-around px-2"
                >
                  <span className="w-2 h-3 bg-[#44403C] rounded-sm opacity-70" />
                  <span className="w-2 h-3 bg-[#44403C] rounded-sm opacity-70" />
                  <span className="w-2 h-3 bg-[#44403C] rounded-sm opacity-70" />
                </div>
              ))}
              <div className="w-full h-16 bg-[#44403C] border-t border-stone-500" />
            </div>
          </div>
        )}

        {index === 3 && (
          // Scene 4: Purasabe Office Entrance Gate
          <div className="w-full h-full bg-gradient-to-b from-emerald-800/80 via-emerald-950/60 to-stone-800 relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-4 left-0 right-0 h-28 bg-emerald-900/50 flex items-center justify-center">
              {/* Surrounding green trees backdrop */}
              <div className="w-full flex justify-around opacity-40 text-emerald-300 text-3xl">
                🌲 🌳 🌳 🌲 🌳
              </div>
            </div>
            {/* Red Municipal Arch Gate */}
            <div className="relative mx-auto w-[85%] h-[75%] flex flex-col items-center justify-end">
              {/* Arch Banner with Kannada lettering */}
              <div className="w-[90%] h-12 bg-[#991B1B] text-amber-200 border-2 border-amber-400 rounded-t-xl flex items-center justify-center font-bold text-xs sm:text-sm px-2 shadow-md">
                ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ ಲಕ್ಷ್ಮೇಶ್ವರ
              </div>
              {/* Gate Pillars & Metal Grille */}
              <div className="w-full h-36 flex items-end justify-between px-2 bg-stone-700/60 border-b-4 border-stone-900">
                <div className="w-8 h-full bg-[#B91C1C] border-r-2 border-stone-900" />
                <div className="flex-1 h-28 border-2 border-stone-800 mx-2 flex items-center justify-around bg-stone-900/40">
                  <div className="w-1 h-full bg-stone-500" />
                  <div className="w-1 h-full bg-stone-500" />
                  <div className="w-1 h-full bg-stone-500" />
                  <div className="w-1 h-full bg-stone-500" />
                </div>
                <div className="w-8 h-full bg-[#B91C1C] border-l-2 border-stone-900" />
              </div>
              {/* Ground with parked scooters */}
              <div className="w-full h-10 bg-stone-800 flex items-center justify-around text-xs text-stone-300">
                <span>🛵</span>
                <span>🏍️</span>
                <span>🛵</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide Title Tag Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 text-white text-left transition-opacity">
        <h2 className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow text-amber-300">
          {slide.title}
        </h2>
        <p className="text-[11px] text-gray-200 line-clamp-1">
          {slide.description}
        </p>
      </div>
    </div>
  );
};
