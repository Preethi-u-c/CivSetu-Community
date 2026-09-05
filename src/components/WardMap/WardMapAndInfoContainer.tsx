"use client";

import React from "react";
import { WardMapSection } from "./WardMapSection";
import { RelatedLinks } from "@/components/RelatedLinks/RelatedLinks";
import { InfoColumns } from "@/components/InfoColumns/InfoColumns";

export const WardMapAndInfoContainer: React.FC = () => {
  return (
    <section className="max-w-[1380px] mx-auto px-4 my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Wardwise Google Map */}
        <div className="lg:col-span-5 w-full">
          <WardMapSection />
        </div>

        {/* Right Column: Related Links + 3-Column Info Area */}
        <div className="lg:col-span-7 w-full flex flex-col justify-between">
          <RelatedLinks />
          <InfoColumns />
        </div>
      </div>
    </section>
  );
};
