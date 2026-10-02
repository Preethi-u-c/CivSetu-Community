"use client";

import React, { useState } from "react";
import {
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  MapPin,
  Layers,
  ExternalLink,
  Compass,
  Building2,
  Landmark,
  Shield,
  Info,
} from "lucide-react";
import { wardsData, WardInfo } from "@/data/wards";
import { useAccessibility } from "@/context/AccessibilityContext";
import { LAKSHMESHWAR_LANDMARKS, LandmarkPreset } from "@/components/Complaints/MunicipalMapPickerModal";

// Geometric polygons for all 23 Lakshmeshwar TMC wards across the 540x400 SVG coordinate grid
const WARD_POLYGONS: { wardNumber: number; path: string; color: string; cx: number; cy: number }[] = [
  { wardNumber: 1, path: "M 170 80 L 260 70 L 275 140 L 160 145 Z", color: "#FEF08A", cx: 215, cy: 110 },
  { wardNumber: 2, path: "M 260 70 L 370 85 L 350 150 L 275 140 Z", color: "#FED7AA", cx: 310, cy: 105 },
  { wardNumber: 3, path: "M 230 145 L 300 145 L 295 210 L 225 210 Z", color: "#FDE047", cx: 265, cy: 175 },
  { wardNumber: 4, path: "M 300 145 L 390 150 L 380 220 L 295 210 Z", color: "#BAE6FD", cx: 345, cy: 180 },
  { wardNumber: 5, path: "M 140 145 L 230 145 L 225 215 L 135 210 Z", color: "#FBCFE8", cx: 180, cy: 180 },
  { wardNumber: 6, path: "M 225 210 L 305 210 L 300 280 L 220 280 Z", color: "#FED7AA", cx: 260, cy: 245 },
  { wardNumber: 7, path: "M 305 210 L 400 215 L 390 285 L 300 280 Z", color: "#BBF7D0", cx: 350, cy: 245 },
  { wardNumber: 8, path: "M 390 285 L 480 290 L 470 360 L 380 355 Z", color: "#DDD6FE", cx: 430, cy: 325 },
  { wardNumber: 9, path: "M 290 285 L 390 285 L 380 360 L 285 355 Z", color: "#E0E7FF", cx: 335, cy: 320 },
  { wardNumber: 10, path: "M 215 285 L 290 285 L 285 365 L 210 360 Z", color: "#FEE2E2", cx: 250, cy: 325 },
  { wardNumber: 11, path: "M 140 285 L 215 285 L 210 360 L 135 355 Z", color: "#FEF3C7", cx: 175, cy: 320 },
  { wardNumber: 12, path: "M 70 280 L 140 285 L 135 355 L 65 350 Z", color: "#CFFAFE", cx: 105, cy: 315 },
  { wardNumber: 13, path: "M 65 210 L 135 210 L 140 280 L 60 280 Z", color: "#D1FAE5", cx: 100, cy: 245 },
  { wardNumber: 14, path: "M 70 145 L 140 145 L 135 210 L 65 210 Z", color: "#EDE9FE", cx: 100, cy: 175 },
  { wardNumber: 15, path: "M 80 80 L 160 80 L 155 145 L 75 145 Z", color: "#FFE4E6", cx: 115, cy: 115 },
  { wardNumber: 16, path: "M 100 20 L 190 20 L 180 80 L 90 80 Z", color: "#E2E8F0", cx: 140, cy: 50 },
  { wardNumber: 17, path: "M 190 20 L 280 15 L 270 70 L 180 80 Z", color: "#FEE2E2", cx: 230, cy: 45 },
  { wardNumber: 18, path: "M 280 15 L 370 20 L 360 80 L 270 70 Z", color: "#DCFCE7", cx: 320, cy: 45 },
  { wardNumber: 19, path: "M 370 20 L 460 30 L 445 95 L 360 80 Z", color: "#FEF08A", cx: 410, cy: 60 },
  { wardNumber: 20, path: "M 370 85 L 470 100 L 455 170 L 365 155 Z", color: "#F3E8FF", cx: 420, cy: 130 },
  { wardNumber: 21, path: "M 390 155 L 485 170 L 475 235 L 385 220 Z", color: "#FFEDD5", cx: 440, cy: 195 },
  { wardNumber: 22, path: "M 400 220 L 495 235 L 485 300 L 390 285 Z", color: "#CCFBF1", cx: 445, cy: 260 },
  { wardNumber: 23, path: "M 215 170 L 285 170 L 280 230 L 210 230 Z", color: "#FDE68A", cx: 248, cy: 200 },
];

export const WardMapSection: React.FC = () => {
  const { t, language } = useAccessibility();
  const isKn = language === "kn";
  const [provider, setProvider] = useState<"gis" | "osm" | "google">("gis");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedWard, setSelectedWard] = useState<WardInfo | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkPreset | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(true);

  const googleMapsEmbedUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    "https://maps.google.com/maps?q=15.1245,75.4744&hl=en&z=15&output=embed";

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleZoomReset = () => setZoomLevel(1);

  const handleSelectWardNumber = (wardNum: number) => {
    const ward = wardsData.find((w) => w.wardNumber === wardNum);
    if (ward) {
      setSelectedWard(ward);
      setSelectedLandmark(null);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Section Header with Teal underline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
            <span>{t.map.heading}</span>
          </h2>
          <div className="w-12 h-1 bg-[#064E4A] dark:bg-[#2DD4BF] mt-1 rounded-full" />
        </div>

        {/* Provider Switcher Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setProvider("gis")}
            className={`px-2.5 py-1 rounded-md transition ${
              provider === "gis"
                ? "bg-white dark:bg-[#064E4A] text-[#064E4A] dark:text-teal-200 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            23 Wards GIS
          </button>
          <button
            type="button"
            onClick={() => setProvider("osm")}
            className={`px-2.5 py-1 rounded-md transition ${
              provider === "osm"
                ? "bg-white dark:bg-[#064E4A] text-[#064E4A] dark:text-teal-200 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            OpenStreetMap
          </button>
          <button
            type="button"
            onClick={() => setProvider("google")}
            className={`px-2.5 py-1 rounded-md transition ${
              provider === "google"
                ? "bg-white dark:bg-[#064E4A] text-[#064E4A] dark:text-teal-200 shadow-xs font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            Google Maps
          </button>
        </div>
      </div>

      {/* Map Card Container */}
      <div
        className={`bg-white dark:bg-[#071f1d] border border-gray-300 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col transition-all ${
          isFullscreen
            ? "fixed inset-2 sm:inset-6 z-50 shadow-2xl bg-white dark:bg-[#071f1d]"
            : "h-[380px] sm:h-[460px]"
        }`}
      >
        {/* Map Top Title Bar */}
        <div className="bg-[#1E293B] dark:bg-[#042422] text-white px-3 sm:px-4 py-2 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold truncate tracking-wide">
              {provider === "gis" && "Lakshmeshwar TMC • 23 Wards Boundary GIS"}
              {provider === "osm" && "Lakshmeshwar TMC • OpenStreetMap Live Slippy Map"}
              {provider === "google" && "Lakshmeshwar TMC • Google Satellite & Street Embed"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {provider === "gis" && (
              <button
                type="button"
                onClick={() => setShowLandmarks(!showLandmarks)}
                className={`text-[11px] px-2 py-0.5 rounded transition ${
                  showLandmarks
                    ? "bg-teal-700/80 text-teal-200 font-bold"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {showLandmarks ? "Landmarks: ON" : "Landmarks: OFF"}
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-neutral-700 rounded text-gray-300 hover:text-white transition"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Map Canvas Area */}
        <div className="relative flex-1 bg-[#F4EFE6] dark:bg-[#0d1e1c] overflow-hidden flex items-center justify-center">
          {provider === "osm" ? (
            <div className="w-full h-full relative">
              <iframe
                title="Lakshmeshwar Town OpenStreetMap"
                src="https://www.openstreetmap.org/export/embed.html?bbox=75.4500%2C15.1050%2C75.4950%2C15.1450&amp;layer=mapnik&amp;marker=15.1245%2C75.4744"
                className="w-full h-full border-0 select-none"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 text-[10px] px-2 py-1 rounded shadow text-gray-600 dark:text-gray-300 backdrop-blur-xs flex items-center gap-1">
                <span>Lakshmeshwar TMC (15.1245°N, 75.4744°E)</span>
                <a
                  href="https://www.openstreetmap.org/?mlat=15.1245&amp;mlon=75.4744#map=15/15.1245/75.4744"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 dark:text-teal-400 font-bold hover:underline flex items-center gap-0.5 ml-1"
                >
                  <span>Open Full OSM</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : provider === "google" ? (
            <div className="w-full h-full relative">
              <iframe
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0 select-none"
                title="Lakshmeshwar TMC Google Map"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 text-[10px] px-2 py-1 rounded shadow text-gray-600 dark:text-gray-300 backdrop-blur-xs flex items-center gap-1">
                <span>Google Maps View</span>
                <a
                  href="https://maps.google.com/?q=Lakshmeshwar+Town+Municipal+Council"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-700 dark:text-teal-400 font-bold hover:underline flex items-center gap-0.5 ml-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            // High-fidelity Interactive SVG Municipal Ward GIS Map of Lakshmeshwar TMC
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200 relative select-none"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 540 400"
                className="w-full h-full max-w-[540px] max-h-[400px] select-none pointer-events-auto"
                role="img"
                aria-label="Lakshmeshwar Municipal Ward GIS Map"
              >
                {/* Background Roads / Terrain Lines */}
                <path d="M 40 80 Q 270 200 490 310" stroke="#DDD4C4" strokeWidth="6" fill="none" />
                <path d="M 120 380 Q 280 200 380 40" stroke="#DDD4C4" strokeWidth="5" fill="none" />
                <path d="M 20 230 H 510" stroke="#D3C9B7" strokeWidth="3" fill="none" strokeDasharray="5 5" />
                <path d="M 270 20 V 380" stroke="#D3C9B7" strokeWidth="2.5" fill="none" strokeDasharray="4 4" />

                {/* 23 Ward Polygons */}
                {WARD_POLYGONS.map((wp) => {
                  const isSelected = selectedWard?.wardNumber === wp.wardNumber;
                  return (
                    <g key={wp.wardNumber}>
                      <path
                        d={wp.path}
                        fill={isSelected ? "#F59E0B" : wp.color}
                        fillOpacity={isSelected ? 0.9 : 0.75}
                        stroke={isSelected ? "#92400E" : "#FFFFFF"}
                        strokeWidth={isSelected ? 3 : 1.8}
                        className="hover:opacity-95 hover:stroke-teal-700 cursor-pointer transition"
                        onClick={() => handleSelectWardNumber(wp.wardNumber)}
                      >
                        <title>
                          Ward {wp.wardNumber} - Lakshmeshwar TMC
                        </title>
                      </path>
                      <text
                        x={wp.cx}
                        y={wp.cy}
                        fontSize="9"
                        fontWeight="bold"
                        fill={isSelected ? "#FFFFFF" : "#334155"}
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        W-{wp.wardNumber}
                      </text>
                    </g>
                  );
                })}

                {/* Town Core Indicator */}
                <circle cx="265" cy="180" r="5" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="275" y="184" fontSize="11" fontWeight="bold" fill="#0F172A">
                  Lakshmeshwar Central
                </text>

                {/* Key Municipal Landmarks (Toggleable) */}
                {showLandmarks &&
                  LAKSHMESHWAR_LANDMARKS.slice(0, 10).map((lm) => {
                    const isSelected = selectedLandmark?.id === lm.id;
                    return (
                      <g
                        key={lm.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedLandmark(lm);
                          handleSelectWardNumber(lm.wardNumber);
                        }}
                      >
                        <circle
                          cx={lm.pinX}
                          cy={lm.pinY}
                          r={isSelected ? 6 : 4}
                          fill={isSelected ? "#2563EB" : "#0D9488"}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        <text
                          x={lm.pinX + 7}
                          y={lm.pinY + 3}
                          fontSize="8"
                          fontWeight="bold"
                          fill="#0F172A"
                          className="hidden sm:inline select-none"
                        >
                          {lm.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
              </svg>
            </div>
          )}

          {/* Selected Ward Detail Popover */}
          {selectedWard && (
            <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#061e1c]/95 backdrop-blur-sm border border-[#064E4A]/30 p-3 rounded-xl shadow-lg max-w-[240px] text-xs z-20 space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-[#064E4A] dark:text-teal-300">
                  {isKn && selectedWard.nameKn ? selectedWard.nameKn : selectedWard.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedWard(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold ml-2 text-sm"
                  aria-label="Close ward popup"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Councillor:</span> {selectedWard.representative || "Ward Member"}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Population:</span> ~{selectedWard.population.toLocaleString()} citizens
              </p>
              <p className="text-[10px] text-teal-800 dark:text-teal-300 font-mono">
                GPS: {selectedWard.lat || 15.1245}°N, {selectedWard.lng || 75.4744}°E
              </p>
            </div>
          )}

          {/* Selected Landmark Popover */}
          {selectedLandmark && !selectedWard && (
            <div className="absolute top-3 left-3 bg-white/95 dark:bg-[#061e1c]/95 backdrop-blur-sm border border-teal-500/40 p-3 rounded-xl shadow-lg max-w-[240px] text-xs z-20 space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-teal-800 dark:text-teal-300">
                  {isKn ? selectedLandmark.kannadaName : selectedLandmark.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLandmark(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold ml-2 text-sm"
                  aria-label="Close landmark popup"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                {selectedLandmark.description}
              </p>
              <p className="text-[10px] text-[#064E4A] dark:text-teal-400 font-semibold">
                Located in {selectedLandmark.wardName}
              </p>
            </div>
          )}

          {/* Zoom Buttons Controls (GIS Vector view) */}
          {provider === "gis" && (
            <div className="absolute left-3 bottom-10 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-700 z-10 overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 transition"
                aria-label={t.map.zoomIn}
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 transition"
                aria-label={t.map.zoomOut}
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-2 py-1 text-[9px] font-bold hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-center transition"
                title="Reset Zoom"
              >
                1:1
              </button>
            </div>
          )}

          {/* Map Attribution / Watermark Footer */}
          <div className="absolute bottom-1 inset-x-2 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 select-none pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span>Lakshmeshwar TMC GIS ©2026</span>
              <span>•</span>
              <span>23 Wards</span>
              <span>•</span>
              <span className="font-mono">15.1245°N, 75.4744°E</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#064E4A] dark:text-teal-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">CivSetu GIS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
