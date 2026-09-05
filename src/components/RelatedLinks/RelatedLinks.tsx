"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { relatedLinks, RelatedLink } from "@/data/relatedLinks";
import { useAccessibility } from "@/context/AccessibilityContext";
import { StateEmblem } from "@/components/Header/StateEmblem";

export const RelatedLinks: React.FC = () => {
  const { t, language } = useAccessibility();
  const isKn = language === "kn";
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -180, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 180, behavior: "smooth" });
    }
  };

  const renderBadgeLogo = (type: RelatedLink["iconType"]) => {
    switch (type) {
      case "state-emblem":
      case "udd":
        return <StateEmblem className="w-9 h-9" />;
      case "bbmp":
        return (
          <div className="w-8 h-8 rounded-full border border-teal-300 flex items-center justify-center font-bold text-[10px] text-white bg-teal-800">
            BBMP
          </div>
        );
      case "national-portal":
        return (
          <div className="w-8 h-8 rounded-full border border-amber-300 flex items-center justify-center font-bold text-[10px] text-amber-200 bg-blue-900">
            🏛️
          </div>
        );
      case "kuidfc":
        return (
          <div className="w-8 h-8 rounded-full border border-yellow-400 flex items-center justify-center font-bold text-[9px] text-yellow-300 bg-amber-900">
            KUIDFC
          </div>
        );
      case "cmak":
        return (
          <div className="w-8 h-8 rounded-full border border-rose-300 flex items-center justify-center font-bold text-[9px] text-rose-200 bg-pink-950">
            CMAK
          </div>
        );
      default:
        return <StateEmblem className="w-8 h-8" />;
    }
  };

  const getLinkBgColor = (id: string) => {
    switch (id) {
      case "gok":
        return "bg-[#064E4A]";
      case "bbmp":
        return "bg-[#0B6B63]";
      case "india-portal":
        return "bg-[#1E3A8A]";
      case "kuidfc":
        return "bg-[#78350F]";
      case "cmak":
        return "bg-[#831843]";
      case "udd":
        return "bg-[#065F46]";
      default:
        return "bg-[#064E4A]";
    }
  };

  return (
    <div className="w-full flex flex-col mb-4">
      {/* Section Header with Teal underline */}
      <div className="mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          {t.relatedLinks.heading}
        </h2>
        <div className="w-12 h-1 bg-[#064E4A] dark:bg-[#2DD4BF] mt-1 rounded-full" />
      </div>

      {/* Slider Carousel with side chevrons */}
      <div className="relative flex items-center">
        <button
          onClick={scrollLeft}
          className="absolute -left-2 z-10 w-7 h-7 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center shadow-md transition"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 px-3 scroll-smooth w-full"
          style={{ scrollbarWidth: "none" }}
        >
          {relatedLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${getLinkBgColor(
                link.id
              )} text-white flex-shrink-0 w-[105px] h-[95px] rounded-lg p-2 flex flex-col items-center justify-between text-center shadow-sm hover:scale-[1.03] transition-transform group`}
              title={isKn ? link.nameKn : link.name}
            >
              <div className="mt-0.5">{renderBadgeLogo(link.iconType)}</div>
              <span className="text-[10px] font-semibold leading-tight line-clamp-2 text-white">
                {isKn ? link.nameKn : link.name}
              </span>
            </a>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="absolute -right-2 z-10 w-7 h-7 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center shadow-md transition"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
