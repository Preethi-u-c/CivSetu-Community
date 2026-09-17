"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/data/heroSlides";
import { HeroSlideCard } from "./HeroSlideCard";

export const HeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  }, []);

  // Auto play
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    }

    if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diffX =
      touchStartX.current - e.changedTouches[0].clientX;

    if (diffX > 50) {
      nextSlide();
    } else if (diffX < -50) {
      prevSlide();
    }

    touchStartX.current = null;
  };

  return (
    <section
      aria-label="Civic Heritage & Purasabe Showcase"
      className="relative w-full max-w-[1380px] mx-auto px-4 mt-2 mb-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Carousel */}
      <div
        className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 bg-gray-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Image */}
        <HeroSlideCard
          slide={heroSlides[currentIndex]}
          index={currentIndex}
        />

        {/* Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                     w-9 h-9 sm:w-10 sm:h-10
                     rounded-full
                     bg-white/90 hover:bg-white
                     text-gray-800
                     shadow-md
                     flex items-center justify-center
                     transition-transform hover:scale-105"
          aria-label="Previous image"
          title="Previous image"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                     w-9 h-9 sm:w-10 sm:h-10
                     rounded-full
                     bg-white/90 hover:bg-white
                     text-gray-800
                     shadow-md
                     flex items-center justify-center
                     transition-transform hover:scale-105"
          aria-label="Next image"
          title="Next image"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Dots */}
      <div
        className="flex justify-center items-center gap-2 mt-3"
        role="tablist"
      >
        {heroSlides.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`rounded-full transition-all duration-300 ${idx === currentIndex
              ? "w-3 h-3 bg-[#B98519]"
              : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
            role="tab"
            aria-selected={idx === currentIndex}
          />
        ))}
      </div>
    </section>
  );
};