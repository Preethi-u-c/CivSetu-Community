"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  X,
  Crosshair,
  Check,
  Search,
  Compass,
  Building,
  Landmark,
  Layers,
  Info,
} from "lucide-react";
import { wardsData } from "@/data/wards";

export interface LandmarkPreset {
  id: string;
  name: string;
  kannadaName: string;
  wardNumber: number;
  wardName: string;
  lat: number;
  lng: number;
  description: string;
  pinX: number; // SVG viewBox coordinate (0-540)
  pinY: number; // SVG viewBox coordinate (0-400)
}

export const LAKSHMESHWAR_LANDMARKS: LandmarkPreset[] = [
  {
    id: "someshwara",
    name: "Someshwara Temple Complex",
    kannadaName: "ಸೋಮೇಶ್ವರ ದೇವಸ್ಥಾನ ಆವರಣ",
    wardNumber: 3,
    wardName: "Lakshmeshwar Ward No. 3",
    lat: 15.1245,
    lng: 75.4744,
    description: "Historic 12th-century temple precinct & Main Bazaar Street",
    pinX: 270,
    pinY: 200,
  },
  {
    id: "tmc_office",
    name: "Lakshmeshwar TMC Municipal Council Office",
    kannadaName: "ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ",
    wardNumber: 1,
    wardName: "Lakshmeshwar Ward No. 1",
    lat: 15.1278,
    lng: 75.4721,
    description: "Central administrative headquarters & Citizen Facilitation Centre",
    pinX: 215,
    pinY: 110,
  },
  {
    id: "bus_stand",
    name: "KSRTC Central Bus Stand Junction",
    kannadaName: "ಬಸ್ ನಿಲ್ದಾಣ ವೃತ್ತ",
    wardNumber: 4,
    wardName: "Lakshmeshwar Ward No. 4",
    lat: 15.1262,
    lng: 75.4760,
    description: "Main arterial transit junction & commercial circle",
    pinX: 320,
    pinY: 160,
  },
  {
    id: "apmc_market",
    name: "APMC Market Yard & Grain Mandi",
    kannadaName: "ಎ.ಪಿ.ಎಂ.ಸಿ ಮಾರುಕಟ್ಟೆ ಪ್ರಾಂಗಣ",
    wardNumber: 7,
    wardName: "Lakshmeshwar Ward No. 7",
    lat: 15.1210,
    lng: 75.4795,
    description: "Agricultural produce market & trade terminal",
    pinX: 400,
    pinY: 280,
  },
  {
    id: "govt_hospital",
    name: "Government General Hospital",
    kannadaName: "ಸರ್ಕಾರಿ ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆ",
    wardNumber: 5,
    wardName: "Lakshmeshwar Ward No. 5",
    lat: 15.1230,
    lng: 75.4735,
    description: "Primary municipal healthcare facility & emergency wing",
    pinX: 240,
    pinY: 240,
  },
  {
    id: "fort_ground",
    name: "Fort Area & Historic Kalyani",
    kannadaName: "ಕೋಟೆ ಆವರಣ ಹಾಗೂ ಕಲ್ಯಾಣಿ",
    wardNumber: 2,
    wardName: "Lakshmeshwar Ward No. 2",
    lat: 15.1290,
    lng: 75.4710,
    description: "Historic monument perimeter and heritage stepwell",
    pinX: 310,
    pinY: 100,
  },
  {
    id: "doddapete",
    name: "Doddapete Commercial Market Lane",
    kannadaName: "ದೊಡ್ಡಪೇಟೆ ಮುಖ್ಯ ಮಾರುಕಟ್ಟೆ",
    wardNumber: 6,
    wardName: "Lakshmeshwar Ward No. 6",
    lat: 15.1250,
    lng: 75.4740,
    description: "High-density retail lane and central civic shopping corridor",
    pinX: 260,
    pinY: 180,
  },
  {
    id: "water_works",
    name: "TMC Water Works & Pumping Station",
    kannadaName: "ನೀರು ಸರಬರಾಜು ಜಲಸಂಗ್ರಹಾಗಾರ",
    wardNumber: 8,
    wardName: "Lakshmeshwar Ward No. 8",
    lat: 15.1195,
    lng: 75.4820,
    description: "Municipal water treatment and distribution reservoir",
    pinX: 430,
    pinY: 320,
  },
  {
    id: "police_station",
    name: "Lakshmeshwar Police Station",
    kannadaName: "ಪೊಲೀಸ್ ಠಾಣೆ ವೃತ್ತ",
    wardNumber: 10,
    wardName: "Lakshmeshwar Ward No. 10",
    lat: 15.1175,
    lng: 75.473,
    description: "Town law enforcement precinct & emergency civic outpost",
    pinX: 280,
    pinY: 360,
  },
  {
    id: "taluk_panchayat",
    name: "Lakshmeshwar Taluk Panchayat Office",
    kannadaName: "ತಾಲೂಕು ಪಂಚಾಯತ್ ಕಾರ್ಯಾಲಯ",
    wardNumber: 11,
    wardName: "Lakshmeshwar Ward No. 11",
    lat: 15.119,
    lng: 75.469,
    description: "Rural and taluk development administrative headquarters",
    pinX: 200,
    pinY: 350,
  },
  {
    id: "sub_registrar",
    name: "Sub-Registrar & Revenue Office",
    kannadaName: "ಉಪನೋಂದಣಾಧಿಕಾರಿ ಹಾಗೂ ಕಂದಾಯ ಕಚೇರಿ",
    wardNumber: 14,
    wardName: "Lakshmeshwar Ward No. 14",
    lat: 15.126,
    lng: 75.465,
    description: "Property registration, land records & municipal revenue zone",
    pinX: 90,
    pinY: 190,
  },
  {
    id: "library",
    name: "City Central Library & Reading Room",
    kannadaName: "ನಗರ ಕೇಂದ್ರ ಗ್ರಂಥಾಲಯ",
    wardNumber: 16,
    wardName: "Lakshmeshwar Ward No. 16",
    lat: 15.132,
    lng: 75.468,
    description: "Public municipal library and cultural knowledge repository",
    pinX: 150,
    pinY: 50,
  },
  {
    id: "fire_station",
    name: "Fire & Emergency Services Station",
    kannadaName: "ಅಗ್ನಿಶಾಮಕ ಹಾಗೂ ತುರ್ತು ಸೇವೆಗಳ ಠಾಣೆ",
    wardNumber: 19,
    wardName: "Lakshmeshwar Ward No. 19",
    lat: 15.131,
    lng: 75.4795,
    description: "Emergency fire response and disaster rescue base",
    pinX: 400,
    pinY: 70,
  },
  {
    id: "hescom_station",
    name: "HESCOM 110kV Electrical Substation",
    kannadaName: "ಹೆಸ್ಕಾಂ ೧೧೦ಕೆವಿ ವಿದ್ಯುತ್ ಉಪಕೇಂದ್ರ",
    wardNumber: 21,
    wardName: "Lakshmeshwar Ward No. 21",
    lat: 15.1245,
    lng: 75.483,
    description: "Regional power grid distribution & municipal electricity maintenance",
    pinX: 470,
    pinY: 210,
  },
];

export interface MunicipalLocationSelectedData {
  latitude: number;
  longitude: number;
  landmarkName: string;
  wardNumber: number;
  wardCode: string;
  wardName: string;
  isSpecificLandmark: boolean;
  privacyMode?: "fuzzed" | "precise";
  isPrivacyFuzzed?: boolean;
}

/**
 * Normalizes any ward representation (number, "Ward 20", "Ward 4", "Lakshmeshwar Ward No. 20")
 * into the canonical option value format: "Ward XX" (e.g., "Ward 20", "Ward 04").
 */
export const normalizeWardValue = (wardInput?: string | number | null): string => {
  if (!wardInput) return "";
  const str = String(wardInput).trim();
  const match = str.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 23) {
      return `Ward ${String(num).padStart(2, "0")}`;
    }
  }
  return str;
};

interface MunicipalMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: MunicipalLocationSelectedData) => void;
  initialLat?: number | null;
  initialLng?: number | null;
}

// Centroids for all 23 Lakshmeshwar TMC wards across the 540x400 SVG map grid
export const WARD_CENTROIDS: { wardNumber: number; x: number; y: number }[] = [
  { wardNumber: 1, x: 215, y: 110 },
  { wardNumber: 2, x: 305, y: 105 },
  { wardNumber: 3, x: 270, y: 190 },
  { wardNumber: 4, x: 375, y: 190 },
  { wardNumber: 5, x: 170, y: 195 },
  { wardNumber: 6, x: 255, y: 275 },
  { wardNumber: 7, x: 370, y: 285 },
  { wardNumber: 8, x: 425, y: 340 },
  { wardNumber: 9, x: 340, y: 360 },
  { wardNumber: 10, x: 280, y: 360 },
  { wardNumber: 11, x: 200, y: 350 },
  { wardNumber: 12, x: 130, y: 330 },
  { wardNumber: 13, x: 90, y: 270 },
  { wardNumber: 14, x: 90, y: 190 },
  { wardNumber: 15, x: 90, y: 110 },
  { wardNumber: 16, x: 150, y: 50 },
  { wardNumber: 17, x: 230, y: 40 },
  { wardNumber: 18, x: 320, y: 45 },
  { wardNumber: 19, x: 400, y: 70 },
  { wardNumber: 20, x: 450, y: 130 },
  { wardNumber: 21, x: 470, y: 210 },
  { wardNumber: 22, x: 470, y: 270 },
  { wardNumber: 23, x: 270, y: 230 },
];

export const MunicipalMapPickerModal: React.FC<MunicipalMapPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat,
  initialLng,
}) => {
  // Coordinate bounds for Lakshmeshwar TMC
  // Center: ~15.1245°N, 75.4744°E
  const MIN_LAT = 15.115;
  const MAX_LAT = 15.135;
  const MIN_LNG = 75.465;
  const MAX_LNG = 75.485;

  // Selected Pin Coordinates in SVG coordinate space (0-540, 0-400)
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number }>({
    x: 270,
    y: 200,
  });

  const [currentLat, setCurrentLat] = useState<number>(initialLat || 15.1245);
  const [currentLng, setCurrentLng] = useState<number>(initialLng || 75.4744);
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkPreset | null>(
    LAKSHMESHWAR_LANDMARKS[0]
  );
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [privacyMode, setPrivacyMode] = useState<"fuzzed" | "precise">("fuzzed");
  const [mapView, setMapView] = useState<"gis" | "osm">("gis");
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync initial coordinates on opening
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setCurrentLat(initialLat);
        setCurrentLng(initialLng);
        // Find closest landmark if any
        let closest = LAKSHMESHWAR_LANDMARKS[0];
        let minDist = Infinity;
        for (const lm of LAKSHMESHWAR_LANDMARKS) {
          const d = Math.hypot(lm.lat - initialLat, lm.lng - initialLng);
          if (d < minDist) {
            minDist = d;
            closest = lm;
          }
        }
        if (minDist < 0.005) {
          setSelectedLandmark(closest);
          setSelectedWardNumber(closest.wardNumber);
          setPinPosition({ x: closest.pinX, y: closest.pinY });
        } else {
          // Convert lat/lng to SVG x,y
          const x = Math.round(((initialLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 540);
          const y = Math.round(((MAX_LAT - initialLat) / (MAX_LAT - MIN_LAT)) * 400);
          setPinPosition({
            x: Math.max(30, Math.min(510, x)),
            y: Math.max(30, Math.min(370, y)),
          });
          // Determine closest ward centroid
          let closestWard = 1;
          let minWDist = Infinity;
          for (const w of WARD_CENTROIDS) {
            const d = Math.hypot(w.x - x, w.y - y);
            if (d < minWDist) {
              minWDist = d;
              closestWard = w.wardNumber;
            }
          }
          setSelectedWardNumber(closestWard);
          setSelectedLandmark(null);
        }
      }
    }
  }, [isOpen, initialLat, initialLng]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle user clicking on SVG map canvas
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Normalize to 0-540, 0-400 SVG viewBox
    const svgX = Math.round((clickX / rect.width) * 540);
    const svgY = Math.round((clickY / rect.height) * 400);

    setPinPosition({ x: svgX, y: svgY });

    // Interpolate geographic coordinates
    const lng = parseFloat((MIN_LNG + (svgX / 540) * (MAX_LNG - MIN_LNG)).toFixed(6));
    const lat = parseFloat((MAX_LAT - (svgY / 400) * (MAX_LAT - MIN_LAT)).toFixed(6));

    setCurrentLat(lat);
    setCurrentLng(lng);

    // Find nearest landmark
    let nearest: LandmarkPreset | null = null;
    let minD = Infinity;
    for (const lm of LAKSHMESHWAR_LANDMARKS) {
      const d = Math.hypot(lm.pinX - svgX, lm.pinY - svgY);
      if (d < minD) {
        minD = d;
        nearest = lm;
      }
    }

    if (minD < 50 && nearest) {
      setSelectedLandmark(nearest);
      setSelectedWardNumber(nearest.wardNumber);
    } else {
      setSelectedLandmark(null);
      // Determine nearest ward centroid among all 23 Lakshmeshwar wards
      let closestWard = 1;
      let minWDist = Infinity;
      for (const w of WARD_CENTROIDS) {
        const d = Math.hypot(w.x - svgX, w.y - svgY);
        if (d < minWDist) {
          minWDist = d;
          closestWard = w.wardNumber;
        }
      }
      setSelectedWardNumber(closestWard);
    }
  };

  // Landmark selection
  const handleSelectLandmark = (lm: LandmarkPreset) => {
    setSelectedLandmark(lm);
    setSelectedWardNumber(lm.wardNumber);
    setCurrentLat(lm.lat);
    setCurrentLng(lm.lng);
    setPinPosition({ x: lm.pinX, y: lm.pinY });
  };

  // Direct ward selection from search
  const handleSelectWardFromSearch = (wardNum: number) => {
    setSelectedLandmark(null);
    setSelectedWardNumber(wardNum);
    const centroid = WARD_CENTROIDS.find((w) => w.wardNumber === wardNum) || { x: 270, y: 200 };
    setPinPosition({ x: centroid.x, y: centroid.y });
    const lng = parseFloat((MIN_LNG + (centroid.x / 540) * (MAX_LNG - MIN_LNG)).toFixed(6));
    const lat = parseFloat((MAX_LAT - (centroid.y / 400) * (MAX_LAT - MIN_LAT)).toFixed(6));
    setCurrentLat(lat);
    setCurrentLng(lng);
  };

  // Confirm selection
  const handleConfirm = () => {
    const matchedWard = wardsData.find((w) => w.wardNumber === selectedWardNumber);
    const wardCode = `Ward ${String(selectedWardNumber).padStart(2, "0")}`;
    const landmarkLabel = selectedLandmark
      ? selectedLandmark.name
      : `Pin Location near Ward ${selectedWardNumber}, Lakshmeshwar`;

    // Apply privacy preservation if enabled: round to 3 decimal places (~100m) to avoid storing private home coordinates
    const finalLat = privacyMode === "fuzzed" ? parseFloat(currentLat.toFixed(3)) : currentLat;
    const finalLng = privacyMode === "fuzzed" ? parseFloat(currentLng.toFixed(3)) : currentLng;

    onSelectLocation({
      latitude: finalLat,
      longitude: finalLng,
      landmarkName: landmarkLabel,
      wardNumber: selectedWardNumber,
      wardCode: wardCode,
      wardName: matchedWard ? matchedWard.name : `Lakshmeshwar Ward No. ${selectedWardNumber}`,
      isSpecificLandmark: selectedLandmark !== null,
      privacyMode: privacyMode,
      isPrivacyFuzzed: privacyMode === "fuzzed",
    });
    onClose();
  };

  // Filtered landmarks
  const filteredLandmarks = LAKSHMESHWAR_LANDMARKS.filter(
    (lm) =>
      lm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lm.kannadaName.includes(searchQuery) ||
      lm.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `ward ${lm.wardNumber}`.includes(searchQuery.toLowerCase())
  );

  // Filtered wards for quick ward jumping in search
  const matchingWards = searchQuery.trim()
    ? wardsData.filter(
        (w) =>
          `ward ${w.wardNumber}`.includes(searchQuery.toLowerCase()) ||
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `ward ${String(w.wardNumber).padStart(2, "0")}`.includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="municipal-map-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-white dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#064E4A] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Compass className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3
                id="municipal-map-picker-title"
                className="text-base sm:text-lg font-bold tracking-tight text-white"
              >
                Lakshmeshwar Municipal GIS Map
              </h3>
              <p className="text-xs text-teal-100 flex items-center gap-1.5 mt-0.5">
                <span>Self-Contained Municipal Map</span>
                <span>•</span>
                <span>Privacy-Preserving Geocoding</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Map Provider Switcher */}
            <div className="flex items-center gap-1 bg-white/15 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMapView("gis")}
                className={`px-2.5 py-1 rounded-md transition ${
                  mapView === "gis"
                    ? "bg-white text-[#064E4A] font-bold shadow-xs"
                    : "text-teal-100 hover:text-white"
                }`}
              >
                GIS Vector
              </button>
              <button
                type="button"
                onClick={() => setMapView("osm")}
                className={`px-2.5 py-1 rounded-md transition ${
                  mapView === "osm"
                    ? "bg-white text-[#064E4A] font-bold shadow-xs"
                    : "text-teal-100 hover:text-white"
                }`}
              >
                OpenStreetMap
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close municipal map picker"
              className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Instructions & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Crosshair className="w-4 h-4 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
              <span>
                Click anywhere on the municipal canvas or choose a landmark below to drop your grievance pin.
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search landmark or ward..."
                aria-label="Search landmark or ward"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
              />
            </div>
          </div>

          {/* Interactive Lakshmeshwar TMC Map Canvas (GIS Vector or OpenStreetMap) */}
          <div className="relative bg-[#F5F2EC] dark:bg-[#132220] border-2 border-dashed border-teal-200 dark:border-teal-900 rounded-xl overflow-hidden select-none">
            {mapView === "osm" ? (
              <div className="w-full h-64 sm:h-80 relative">
                <iframe
                  title="Lakshmeshwar OpenStreetMap"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=75.4500%2C15.1050%2C75.4950%2C15.1450&amp;layer=mapnik&amp;marker=${currentLat}%2C${currentLng}`}
                  className="w-full h-full border-0 select-none"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 text-[10px] px-2 py-1 rounded shadow text-gray-700 dark:text-gray-300 font-bold backdrop-blur-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#064E4A] dark:text-teal-400" />
                  <span>OpenStreetMap Live: {currentLat.toFixed(4)}°N, {currentLng.toFixed(4)}°E</span>
                </div>
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox="0 0 540 400"
                onClick={handleSvgClick}
                className="w-full h-64 sm:h-80 cursor-crosshair"
                aria-label="Lakshmeshwar TMC Municipal GIS Grid. Click to place pin."
              >
                {/* Background Municipal Grid */}
                <defs>
                  <pattern id="civic-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E6E0D4" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="540" height="400" fill="url(#civic-grid)" />

              {/* Major Roads / Arterial Networks */}
              <path d="M30 90 Q 270 200 510 320" stroke="#DDD4C4" strokeWidth="8" fill="none" />
              <path d="M130 380 Q 270 210 390 30" stroke="#DDD4C4" strokeWidth="7" fill="none" />
              <path d="M20 220 H 520" stroke="#DDD4C4" strokeWidth="5" fill="none" strokeDasharray="6 4" />
              <path d="M270 20 V 380" stroke="#DDD4C4" strokeWidth="4" fill="none" strokeDasharray="4 4" />

              {/* Lakshmeshwar TMC Outer Boundary */}
              <polygon
                points="110,60 280,30 430,70 510,190 470,330 310,380 140,350 40,240 60,130"
                fill="#064E4A"
                fillOpacity="0.04"
                stroke="#064E4A"
                strokeWidth="2"
                strokeDasharray="5 3"
              />

              {/* Municipal Ward Polygons & Labels */}
              {/* Ward 1 */}
              <path
                d="M160 70 L 250 60 L 265 130 L 150 135 Z"
                fill="#FEF3C7"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="205" y="105" fontSize="10" fontWeight="bold" fill="#78350F" textAnchor="middle">
                Ward 1
              </text>

              {/* Ward 2 */}
              <path
                d="M250 60 L 360 75 L 340 140 L 265 130 Z"
                fill="#FED7AA"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="305" y="105" fontSize="10" fontWeight="bold" fill="#9A3412" textAnchor="middle">
                Ward 2
              </text>

              {/* Ward 3 (Someshwara) */}
              <path
                d="M230 145 L 330 150 L 320 230 L 210 220 Z"
                fill="#CCFBF1"
                stroke="#0D9488"
                strokeWidth="2"
                className="opacity-90 hover:opacity-100 transition cursor-pointer"
              />
              <text x="270" y="190" fontSize="11" fontWeight="bold" fill="#0F766E" textAnchor="middle">
                Ward 3 (Temple)
              </text>

              {/* Ward 4 (Bus Stand) */}
              <path
                d="M330 140 L 430 160 L 410 240 L 320 230 Z"
                fill="#E0E7FF"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="375" y="190" fontSize="10" fontWeight="bold" fill="#3730A3" textAnchor="middle">
                Ward 4 (Bus Stand)
              </text>

              {/* Ward 5 (Hospital) */}
              <path
                d="M130 150 L 220 140 L 210 240 L 120 230 Z"
                fill="#FEE2E2"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="170" y="195" fontSize="10" fontWeight="bold" fill="#991B1B" textAnchor="middle">
                Ward 5
              </text>

              {/* Ward 6 (Doddapete) */}
              <path
                d="M210 230 L 310 240 L 290 310 L 200 300 Z"
                fill="#F3E8FF"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="255" y="275" fontSize="10" fontWeight="bold" fill="#6B21A8" textAnchor="middle">
                Ward 6
              </text>

              {/* Ward 7 (APMC) */}
              <path
                d="M320 235 L 430 250 L 420 330 L 305 320 Z"
                fill="#DCFCE7"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="370" y="285" fontSize="10" fontWeight="bold" fill="#166534" textAnchor="middle">
                Ward 7 (APMC)
              </text>

              {/* Ward 8 (Water Works) */}
              <path
                d="M380 300 L 480 290 L 460 370 L 370 360 Z"
                fill="#DBEAFE"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="opacity-75 hover:opacity-100 transition cursor-pointer"
              />
              <text x="425" y="340" fontSize="10" fontWeight="bold" fill="#1E40AF" textAnchor="middle">
                Ward 8
              </text>

              {/* Canonical Landmark Marker Pins */}
              {LAKSHMESHWAR_LANDMARKS.map((lm) => {
                const isSelected = selectedLandmark?.id === lm.id;
                return (
                  <g
                    key={lm.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLandmark(lm);
                    }}
                  >
                    <circle
                      cx={lm.pinX}
                      cy={lm.pinY}
                      r={isSelected ? "12" : "7"}
                      fill={isSelected ? "#064E4A" : "#0D9488"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    <circle
                      cx={lm.pinX}
                      cy={lm.pinY}
                      r="3"
                      fill="#FFFFFF"
                    />
                    <text
                      x={lm.pinX}
                      y={lm.pinY - 10}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#064E4A"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow"
                    >
                      {lm.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Active Incident Pin Indicator */}
              <g
                transform={`translate(${pinPosition.x}, ${pinPosition.y})`}
                className="transition-all duration-200 pointer-events-none"
              >
                {/* Pulse Ring */}
                <circle r="18" fill="#EF4444" fillOpacity="0.25" className="animate-ping" />
                <circle r="10" fill="#EF4444" fillOpacity="0.4" />
                {/* Incident Pin Icon */}
                <path
                  d="M0 -22 C-6 -22 -10 -18 -10 -12 C-10 -4 0 0 0 0 C0 0 10 -4 10 -12 C10 -18 6 -22 0 -22 Z"
                  fill="#DC2626"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx="0" cy="-13" r="3.5" fill="#FFFFFF" />
              </g>
            </svg>
            )}

            {/* Map Canvas Overlay Badge */}
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-700 dark:text-gray-300 shadow-sm flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
              <span>Lakshmeshwar Town Municipal Area (23 Wards)</span>
            </div>

            <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-mono text-gray-600 dark:text-gray-400 shadow-sm">
              Pin: {currentLat.toFixed(4)}°N, {currentLng.toFixed(4)}°E
            </div>
          </div>

          {/* Quick Select Landmark Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Official Municipal Landmarks (Quick Select)
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {filteredLandmarks.length} landmark sites
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredLandmarks.map((lm) => {
                const isSelected = selectedLandmark?.id === lm.id;
                return (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => handleSelectLandmark(lm)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/40 border-[#064E4A] dark:border-teal-500 text-[#064E4A] dark:text-teal-200 font-semibold ring-1 ring-[#064E4A]"
                        : "bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-teal-300 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-xs">{lm.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {lm.kannadaName} • {lm.wardName}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#064E4A] dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}

              {matchingWards.length > 0 && (
                <div className="col-span-full pt-1">
                  <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 mb-1">
                    Matching Ward Jurisdictions:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchingWards.map((w) => (
                      <button
                        key={w.wardNumber}
                        type="button"
                        onClick={() => handleSelectWardFromSearch(w.wardNumber)}
                        className={`text-left p-2 rounded-lg border text-xs transition flex items-center justify-between ${
                          selectedWardNumber === w.wardNumber && !selectedLandmark
                            ? "bg-teal-100 dark:bg-teal-900 border-[#064E4A] font-bold"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">Ward {w.wardNumber} - {w.name}</span>
                        <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold ml-1">Select</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Preservation Mode Option */}
          <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={privacyMode === "fuzzed"}
                onChange={(e) => setPrivacyMode(e.target.checked ? "fuzzed" : "precise")}
                className="mt-0.5 sm:mt-0 w-4 h-4 rounded text-[#064E4A] focus:ring-[#064E4A]"
              />
              <div>
                <span className="font-bold text-gray-900 dark:text-teal-200">
                  Protect Residential Privacy (Neighborhood Fuzzing ~100m)
                </span>
                <p className="text-[11px] text-gray-600 dark:text-gray-400">
                  Fuzzes coordinates to neighborhood-level to prevent storing exact domestic home GPS in public records.
                </p>
              </div>
            </label>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto shrink-0 ${
                privacyMode === "fuzzed"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {privacyMode === "fuzzed" ? "Privacy Protected" : "Precise Pinpoint"}
            </span>
          </div>

          {/* Selected Location Summary Box */}
          <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                  {selectedLandmark ? selectedLandmark.name : `Ward ${selectedWardNumber} Jurisdiction`}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  Coordinates: {currentLat.toFixed(4)}°N, {currentLng.toFixed(4)}°E (±20m Municipal Precision)
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900 text-[#064E4A] dark:text-teal-200 text-[10px] font-bold whitespace-nowrap">
              Ward {selectedWardNumber}
            </span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Selected Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
