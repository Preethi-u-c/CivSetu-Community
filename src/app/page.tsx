import React from "react";
import { HeroCarousel } from "@/components/HeroCarousel/HeroCarousel";
import { OfficialsSection } from "@/components/Officials/OfficialsSection";
import { QuickServicesSection } from "@/components/QuickServices/QuickServicesSection";
import { WardMapAndInfoContainer } from "@/components/WardMap/WardMapAndInfoContainer";

export default function HomePage() {
  return (
    <div className="w-full pb-6">
      {/* 4. Four-Image Hero Carousel */}
      <HeroCarousel />

      {/* 5. Four Official Profile Cards */}
      <OfficialsSection />

      {/* 6. Four Quick Service Cards */}
      <QuickServicesSection />

      {/* 7 & 8. Wardwise Google Map + Related Links + Visitors/What's New/Contact Info */}
      <WardMapAndInfoContainer />
    </div>
  );
}
