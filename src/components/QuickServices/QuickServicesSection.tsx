"use client";

import React from "react";
import { quickServices } from "@/data/services";
import { QuickServiceCard } from "./QuickServiceCard";
import { useAccessibility } from "@/context/AccessibilityContext";

export const QuickServicesSection: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <section
      aria-label={t.services.heading}
      className="max-w-[1380px] mx-auto px-4 my-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickServices.map((service) => (
          <QuickServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};
