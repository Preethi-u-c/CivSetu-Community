"use client";

import React, { useState } from "react";
import { Maximize2, Plus, Minus, MapPin, Layers } from "lucide-react";
import { wardsData, WardInfo } from "@/data/wards";
import { useAccessibility } from "@/context/AccessibilityContext";

export const WardMapSection: React.FC = () => {
  const { t, language } = useAccessibility();
  const isKn = language === "kn";
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedWard, setSelectedWard] = useState<WardInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Future Google Maps embed URL via environment variable
  const googleMapsEmbedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8));

  return (
    <div className="w-full flex flex-col">
      {/* Section Header with Teal underline */}
      <div className="mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
          {t.map.heading}
        </h2>
        <div className="w-12 h-1 bg-[#064E4A] dark:bg-[#2DD4BF] mt-1 rounded-full" />
      </div>

      {/* Map Card Container */}
      <div
        className={`bg-white dark:bg-[#071f1d] border border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col transition-all ${
          isFullscreen ? "fixed inset-4 z-50 shadow-2xl bg-white" : "h-[450px]"
        }`}
      >
        {/* Map Top Title Bar (matching Google My Maps header in reference) */}
        <div className="bg-[#262626] text-white px-3.5 py-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-300" />
            <span className="text-xs sm:text-sm font-semibold truncate tracking-wide">
              {t.map.title}
            </span>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-neutral-700 rounded text-gray-300 hover:text-white transition"
            aria-label={t.map.fullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Map Canvas Area */}
        <div className="relative flex-1 bg-[#F5F2EC] dark:bg-[#132220] overflow-hidden">
          {googleMapsEmbedUrl ? (
            <iframe
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0"
              title="Lakshmeshwar TMC Google Map"
              loading="lazy"
            />
          ) : (
            // High-fidelity Interactive SVG Ward Map of Lakshmeshwar TMC
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-300 relative"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 540 400"
                className="w-full h-full max-w-[540px] max-h-[400px] select-none"
              >
                {/* Background Roads / Terrain Lines */}
                <path d="M40 80 Q 270 200 490 310" stroke="#E2DCD0" strokeWidth="6" fill="none" />
                <path d="M120 380 Q 280 200 380 40" stroke="#E2DCD0" strokeWidth="5" fill="none" />
                <path d="M20 230 H 510" stroke="#DDD7CB" strokeWidth="3" fill="none" strokeDasharray="4 4" />

                {/* Ward Polygons matching reference shapes & pastel colors */}
                {/* Ward 1 */}
                <path
                  d="M170 80 L 260 70 L 275 140 L 160 145 Z"
                  fill="#FDF2B8"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[0])}
                />
                <text x="215" y="115" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 1
                </text>

                {/* Ward 2 */}
                <path
                  d="M260 70 L 370 85 L 350 150 L 275 140 Z"
                  fill="#FED7AA"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[1])}
                />
                <text x="315" y="120" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 2
                </text>

                {/* Ward 3 */}
                <path
                  d="M80 120 L 170 115 L 160 190 L 70 185 Z"
                  fill="#FCE7F3"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[2])}
                />
                <text x="120" y="155" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 3
                </text>

                {/* Center Core Ward 7 & Lakshmeshwar Central */}
                <path
                  d="M160 145 L 275 140 L 290 220 L 165 220 Z"
                  fill="#DBEAFE"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[3])}
                />
                <text x="220" y="175" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 7
                </text>
                {/* Town Core Pin */}
                <circle cx="230" cy="205" r="4" fill="#E11D48" />
                <text x="235" y="200" fontSize="13" fontWeight="bold" fill="#1E293B">
                  Lakshmeshwar
                </text>

                {/* Ward 8 */}
                <path
                  d="M370 140 L 460 155 L 450 225 L 360 215 Z"
                  fill="#DCFCE7"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[4])}
                />
                <text x="410" y="185" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 8
                </text>

                {/* Ward 9 */}
                <path
                  d="M70 185 L 165 190 L 155 270 L 60 260 Z"
                  fill="#E0E7FF"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[5])}
                />
                <text x="110" y="235" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 9
                </text>

                {/* Ward 12 */}
                <path
                  d="M290 190 L 390 195 L 380 270 L 280 265 Z"
                  fill="#FEE2E2"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[6])}
                />
                <text x="340" y="235" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 12
                </text>

                {/* Ward 13 */}
                <path
                  d="M155 240 L 265 240 L 260 300 L 150 295 Z"
                  fill="#FEF3C7"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[7])}
                />
                <text x="210" y="270" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 13
                </text>

                {/* Ward 14 */}
                <path
                  d="M275 270 L 390 270 L 380 330 L 270 325 Z"
                  fill="#EDE9FE"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[8])}
                />
                <text x="330" y="300" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 14
                </text>

                {/* Ward 18 */}
                <path
                  d="M140 295 L 240 295 L 230 355 L 130 345 Z"
                  fill="#D1FAE5"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="hover:opacity-80 cursor-pointer transition"
                  onClick={() => setSelectedWard(wardsData[9])}
                />
                <text x="185" y="325" fontSize="11" fontWeight="bold" fill="#5F6866" textAnchor="middle">
                  Ward - 18
                </text>
              </svg>
            </div>
          )}

          {/* Selected Ward Detail Popover */}
          {selectedWard && (
            <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#061e1c]/95 backdrop-blur-sm border border-[#064E4A]/30 p-3 rounded-lg shadow-lg max-w-[220px] text-xs z-20">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-[#064E4A] dark:text-teal-300">
                  {isKn ? selectedWard.nameKn : selectedWard.name}
                </span>
                <button
                  onClick={() => setSelectedWard(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Rep:</span> {selectedWard.representative}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Pop:</span> ~{selectedWard.population}
              </p>
            </div>
          )}

          {/* Zoom Buttons Controls (+ / - on left side matching Google Maps) */}
          <div className="absolute left-3 bottom-12 flex flex-col bg-white dark:bg-gray-800 rounded shadow border border-gray-300 dark:border-gray-700 z-10">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700"
              aria-label={t.map.zoomIn}
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              aria-label={t.map.zoomOut}
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Google Maps Attribution / Watermark Footer */}
          <div className="absolute bottom-1 inset-x-2 flex items-center justify-between text-[10px] text-gray-500 select-none pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span>Map data ©2026</span>
              <span className="cursor-pointer hover:underline pointer-events-auto">Terms</span>
              <span>1 km</span>
              <div className="w-8 h-[2px] bg-gray-500 inline-block align-middle" />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="font-semibold text-blue-600">G</span>
              <span className="font-semibold text-red-500">o</span>
              <span className="font-semibold text-yellow-500">o</span>
              <span className="font-semibold text-blue-600">g</span>
              <span className="font-semibold text-green-600">l</span>
              <span className="font-semibold text-red-500">e</span>
              <span className="text-gray-600 ml-1 font-medium">My Maps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
