"use client";

import React from "react";
import Image from "next/image";
import { HeroSlide } from "@/data/heroSlides";

interface HeroSlideCardProps {
  slide: HeroSlide;
  index: number;
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({ slide }) => {
  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[390px] overflow-hidden bg-gray-900 select-none">

      {/* Real Hero Image */}
      <Image
        src={slide.image}
        alt={slide.alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1380px"
        className="object-cover"
      />

      {/* Dark gradient at bottom for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Title and Description */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-sm sm:text-base font-semibold tracking-wide text-amber-300 drop-shadow">
          {slide.title}
        </h2>

        <p className="text-xs sm:text-sm text-white/90 mt-1">
          {slide.description}
        </p>
      </div>
    </div>
  );
};