"use client";

import React from "react";
import { officials } from "@/data/officials";
import { OfficialCard } from "./OfficialCard";
import { useAccessibility } from "@/context/AccessibilityContext";

export const OfficialsSection: React.FC = () => {
  const { t } = useAccessibility();

  return (
    <section
      aria-label={t.officials.heading}
      className="max-w-[1380px] mx-auto px-4 my-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {officials.map((official, idx) => (
          <OfficialCard key={official.id} official={official} index={idx} />
        ))}
      </div>
    </section>
  );
};
