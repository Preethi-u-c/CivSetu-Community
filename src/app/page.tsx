import React from "react";
import { EmergencyBanner } from "@/components/Announcements/EmergencyBanner";
import { HeroCarousel } from "@/components/HeroCarousel/HeroCarousel";
import { OfficialsSection } from "@/components/Officials/OfficialsSection";
import { QuickServicesSection } from "@/components/QuickServices/QuickServicesSection";
import { HomeAnnouncementsSection } from "@/components/Announcements/HomeAnnouncementsSection";
import { WardMapAndInfoContainer } from "@/components/WardMap/WardMapAndInfoContainer";

export default function HomePage() {
  return (
    <div className="w-full pb-6">
      {/* 1. Real-time Emergency Civic Alert Ticker */}
      <EmergencyBanner />

      {/* 2. Hero Carousel */}
      <HeroCarousel />

      {/* 3. Official Profile Cards */}
      <OfficialsSection />

      {/* 4. Quick Service Cards */}
      <QuickServicesSection />

      {/* 5. Official Announcements & Public Bulletins */}
      <HomeAnnouncementsSection />

      {/* 6. Wardwise Google Map + Related Links + Visitors/What's New/Contact Info */}
      <WardMapAndInfoContainer />
    </div>
  );
}
