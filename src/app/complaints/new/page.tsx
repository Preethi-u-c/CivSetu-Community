"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/UI/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { wardsData } from "@/data/wards";
import {
  MunicipalMapPickerModal,
  MunicipalLocationSelectedData,
  normalizeWardValue,
} from "@/components/Complaints/MunicipalMapPickerModal";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Camera,
  Upload,
  X,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  Copy,
  Printer,
  Droplets,
  Trash2,
  Lightbulb,
  Truck,
  ShieldAlert,
  Landmark,
  Trees,
  Zap,
  Waves,
  Compass,
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Layers,
  Crosshair,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  generateComplaintSuggestions,
  ComplaintAssistantResponse,
} from "@/lib/ai/complaint-assistant";

// =============================================================================
// Complaint Category Definitions & Metadata
// =============================================================================

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  department: string;
  examples: string[];
}

const COMPLAINT_CATEGORIES: CategoryItem[] = [
  {
    id: "water",
    name: "Water Supply & Pipelines",
    icon: Droplets,
    description: "Pipeline leakages, low water pressure, contaminated supply, meter defects",
    department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
    examples: [
      "Drinking water pipeline leakage on main road",
      "Low water pressure during morning municipal supply hours",
      "Contaminated / muddy water supply received from municipal line",
      "Damaged public tap / valve leakage outside residential compound",
    ],
  },
  {
    id: "electricity",
    name: "Electricity & Power Supply",
    icon: Zap,
    description: "Transformer faults, loose overhead power lines, phase failures, voltage fluctuations",
    department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
    examples: [
      "Low voltage issues affecting residential locality",
      "Loose or hanging electrical overhead wire near school zone",
      "Sparking transformer near municipal junction",
      "Unannounced prolonged power outage in ward sector",
    ],
  },
  {
    id: "sanitation",
    name: "Public Sanitation & Hygiene",
    icon: Trash2,
    description: "Public toilet maintenance, open urination spots, market cleanliness drives",
    department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
    examples: [
      "Public toilet facility lacks running water or maintenance",
      "Unhygienic open urination spot near bus terminal",
      "Market area requires daily bleaching powder and disinfectant",
      "Commercial meat shop disposing unhygienic waste into open space",
    ],
  },
  {
    id: "roads",
    name: "Roads, Potholes & Footpaths",
    icon: Truck,
    description: "Potholes, broken asphalt, damaged pavements, curb stone repairs",
    department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
    examples: [
      "Deep potholes on municipal road causing traffic hazard",
      "Broken footpath slabs dangerous for senior citizens and school children",
      "Uneven road resurfacing leaving dangerous gravel loose",
      "Missing or broken road divider / speed breaker marker",
    ],
  },
  {
    id: "drainage",
    name: "Drainage & Stormwater Culverts",
    icon: Waves,
    description: "Clogged stormwater drains, UGD manhole overflows, waterlogging during rains",
    department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
    examples: [
      "Clogged stormwater drain causing dirty water overflow onto road",
      "Underground drainage (UGD) manhole overflowing near residence",
      "Severe waterlogging during rainfall due to blocked culvert",
      "Broken or missing storm drain concrete slab / cover",
    ],
  },
  {
    id: "streetlights",
    name: "Streetlights & Dark Stretches",
    icon: Lightbulb,
    description: "Defective streetlights, dark road stretches, damaged poles, flickering fixtures",
    department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
    examples: [
      "Non-functional streetlights creating dark road stretch at night",
      "Flickering LED streetlight fixture causing visibility hazard",
      "Damaged electric pole or exposed underground cables",
      "Request for additional LED streetlight near community junction",
    ],
  },
  {
    id: "waste",
    name: "Solid Waste & Garbage Disposal",
    icon: Trash2,
    description: "Door-to-door collection skipped, overflowing dustbins, open dumping on vacant sites",
    department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
    examples: [
      "Door-to-door municipal waste collection vehicle skipped for consecutive days",
      "Overflowing community garbage bin requiring urgent clearance",
      "Illegal waste dumping on vacant municipal site",
      "Construction debris dumped along municipal road",
    ],
  },
  {
    id: "health",
    name: "Public Health & Mosquito Control",
    icon: ShieldAlert,
    description: "Stagnant water, mosquito fogging, stray animal management, food hygiene",
    department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
    examples: [
      "Stagnant water breeding mosquitoes, urgent fogging requested",
      "Stray dog nuisance near municipal school and residential lanes",
      "Unhygienic open food stalls operating without municipal hygiene license",
      "Request for sanitation spraying in dengue-prone locality",
    ],
  },
  {
    id: "revenue",
    name: "Property Tax & Municipal Revenue",
    icon: Landmark,
    description: "Khata assessment issues, property tax receipts, municipal ownership verification",
    department: "Revenue & Property Assessment Section, Lakshmeshwar TMC",
    examples: [
      "Discrepancy in property tax assessment record",
      "Delayed Form-3 / Sasya Khata extract issuance from revenue wing",
      "Ownership name correction in municipal assessment register",
      "Online property tax payment receipt reconciliation error",
    ],
  },
  {
    id: "parks",
    name: "Parks, Trees & Civic Amenities",
    icon: Trees,
    description: "Overhanging tree branches, park cleanliness, public recreational space maintenance",
    department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
    examples: [
      "Overhanging tree branches threatening electrical power lines",
      "Damaged playground equipment or benches in municipal park",
      "Municipal park grounds requiring grass cutting and cleaning",
      "Illegal encroachment on public municipal park or walkway",
    ],
  },
  {
    id: "other",
    name: "Other Civic Issues & Municipal Enquiries",
    icon: AlertCircle,
    description: "General civic issues, town planning, encroachments, or unlisted municipal services",
    department: "Lakshmeshwar TMC Citizen Facilitation Centre",
    examples: [
      "Public civic nuisance requiring municipal council intervention",
      "Building construction material blocking public right-of-way",
      "Noise or industrial disturbance in designated residential zone",
      "General municipal council inquiry or escalation",
    ],
  },
];

type PriorityLevel = "Low" | "Medium" | "High" | "Urgent";

interface PriorityMeta {
  level: PriorityLevel;
  label: string;
  slaHours: number;
  badgeClass: string;
  description: string;
}

const PRIORITIES: PriorityMeta[] = [
  {
    level: "Low",
    label: "Low Priority",
    slaHours: 120,
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    description: "Resolution within 5 working days (General civic improvements & non-urgent repairs)",
  },
  {
    level: "Medium",
    label: "Medium Priority (Standard)",
    slaHours: 72,
    badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    description: "Resolution within 3 working days (Standard municipal maintenance and service tickets)",
  },
  {
    level: "High",
    label: "High Priority",
    slaHours: 48,
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    description: "Resolution within 48 hours (Significant service disruption affecting neighborhood)",
  },
  {
    level: "Urgent",
    label: "Urgent / Emergency",
    slaHours: 24,
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800",
    description: "Resolution within 24 hours (Critical public safety hazard or major pipeline burst)",
  },
];

export default function NewComplaintPage() {
  const router = useRouter();
  const { citizen, loading: authLoading, isAuthenticated } = useAuth();

  // Wizard Step: 1 = Form, 2 = Review, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Location / GPS State
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationCaptured, setLocationCaptured] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationMethod, setLocationMethod] = useState<"gps" | "map" | "manual" | null>(null);
  const [showCoordinatesDetail, setShowCoordinatesDetail] = useState<boolean>(false);
  const [mapPickerOpen, setMapPickerOpen] = useState<boolean>(false);
  const [selectedLandmarkName, setSelectedLandmarkName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Photo Attachment State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const [photoModalOpen, setPhotoModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Complaint Assistant State (Preview - Single Expandable Panel)
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(true);
  const [aiPromptInput, setAiPromptInput] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<ComplaintAssistantResponse | null>(null);
  const [aiAppliedFields, setAiAppliedFields] = useState<{
    category: boolean;
    title: boolean;
    description: boolean;
  }>({ category: false, title: false, description: false });

  // Backward-compatible reference for legacy audit checks
  const aiGeneratedSuggestion = aiSuggestions
    ? {
        title: aiSuggestions.suggestedTitle,
        description: aiSuggestions.suggestedDescription,
      }
    : null;

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any>(null);

  // Draft Save & Restore State
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Pre-fill user information once authenticated
  useEffect(() => {
    if (citizen) {
      if (!selectedWard && citizen.wardNumber) {
        // Match existing ward format with canonical normalization
        setSelectedWard(normalizeWardValue(citizen.wardNumber));
      }
      if (!address && citizen.residentialAddress) {
        setAddress(citizen.residentialAddress);
      }
    }
  }, [citizen]);

  // Check for existing local draft
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("civsetu_complaint_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.savedAt) {
          setDraftSavedTime(parsed.savedAt);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Save current progress to local draft
  const handleSaveDraft = () => {
    try {
      const draft = {
        category,
        priority,
        title,
        description,
        ward: selectedWard,
        address,
        latitude,
        longitude,
        locationAccuracy,
        locationMethod,
        selectedLandmarkName,
        photoName,
        photoSize,
        // Only cache preview if under 1.5MB to avoid localStorage overflow
        photoPreview: photoPreview && photoPreview.length < 2 * 1024 * 1024 ? photoPreview : null,
        savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      localStorage.setItem("civsetu_complaint_draft", JSON.stringify(draft));
      setDraftSavedTime(draft.savedAt);
    } catch {
      // ignore error
    }
  };

  // Restore saved draft
  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem("civsetu_complaint_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.priority) setPriority(parsed.priority);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.ward) setSelectedWard(normalizeWardValue(parsed.ward));
        if (parsed.address) setAddress(parsed.address);
        if (parsed.latitude) setLatitude(parsed.latitude);
        if (parsed.longitude) setLongitude(parsed.longitude);
        if (parsed.locationAccuracy) setLocationAccuracy(parsed.locationAccuracy);
        if (parsed.locationMethod) setLocationMethod(parsed.locationMethod);
        if (parsed.selectedLandmarkName) setSelectedLandmarkName(parsed.selectedLandmarkName);
        if (parsed.latitude && parsed.longitude) setLocationCaptured(true);
        if (parsed.photoName) setPhotoName(parsed.photoName);
        if (parsed.photoSize) setPhotoSize(parsed.photoSize);
        if (parsed.photoPreview) setPhotoPreview(parsed.photoPreview);
      }
    } catch {
      // ignore error
    }
  };

  // Discard saved draft
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem("civsetu_complaint_draft");
      setDraftSavedTime(null);
    } catch {
      // ignore
    }
  };

  // GPS / Geolocation Capture (Real Browser Geolocation with actual accuracy & graceful error handling)
  const handleCaptureLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationStatus("Querying device GPS sensors...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          const acc = Math.round(pos.coords.accuracy); // Actual browser-reported accuracy!
          setLatitude(lat);
          setLongitude(lng);
          setLocationAccuracy(acc);
          setLocationCaptured(true);
          setLocationMethod("gps");
          setIsLocating(false);
          setLocationError(null);
          setLocationStatus(
            `Coordinates tagged: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (±${acc}m actual accuracy)`
          );
        },
        (err) => {
          setIsLocating(false);
          let errorMsg = "Unable to retrieve device GPS location.";
          if (err.code === 1) { // PERMISSION_DENIED
            errorMsg = "Location access was denied. You can manually enter the landmark or pick a location on the municipal map.";
          } else if (err.code === 2) { // POSITION_UNAVAILABLE
            errorMsg = "Location information is unavailable from your device GPS. You can select your location on the municipal map.";
          } else if (err.code === 3) { // TIMEOUT
            errorMsg = "GPS request timed out. Please try again or select from the municipal map.";
          }
          setLocationError(errorMsg);
          setLocationStatus(null);
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
      setLocationError("Geolocation is not supported by your browser. Please select your location on the municipal map.");
      setLocationStatus(null);
    }
  };

  // Municipal Center Quick Fallback Coordinates
  const handleUseMunicipalCenter = () => {
    const fallbackLat = 15.1245;
    const fallbackLng = 75.4744;
    setLatitude(fallbackLat);
    setLongitude(fallbackLng);
    setLocationAccuracy(50);
    setLocationCaptured(true);
    setLocationMethod("manual");
    setIsLocating(false);
    setLocationError(null);
    setSelectedLandmarkName("Lakshmeshwar TMC Municipal Zone");
    setLocationStatus(
      "GPS Tagged: 15.1245°N, 75.4744°E (Lakshmeshwar TMC Municipal Zone)"
    );
    if (!address || address.trim().length === 0) {
      setAddress("Near Someshwara Temple, Lakshmeshwar Municipal Area");
    }
  };

  const handleClearLocation = () => {
    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);
    setLocationCaptured(false);
    setLocationStatus(null);
    setLocationError(null);
    setLocationMethod(null);
    setSelectedLandmarkName(null);
  };

  const handleMapLocationSelected = (
    data:
      | MunicipalLocationSelectedData
      | {
          latitude: number;
          longitude: number;
          landmarkName: string;
          wardNumber?: number;
          wardCode?: string;
          wardName?: string;
          isSpecificLandmark?: boolean;
        }
  ) => {
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setLocationAccuracy(20); // 20m municipal GIS pin precision
    setLocationCaptured(true);
    setLocationMethod("map");
    setLocationError(null);

    // 1. Resolve and synchronize Ward Jurisdiction to canonical "Ward XX" format
    const targetWardCode = normalizeWardValue(
      ("wardCode" in data && data.wardCode) || data.wardNumber || data.wardName
    );
    if (targetWardCode) {
      setSelectedWard(targetWardCode);
      if (errors.ward) {
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.ward;
          return rest;
        });
      }
    }

    // 2. Resolve Incident Location / Landmark and maintain consistency with Location Card
    const isSpecific = Boolean(data.isSpecificLandmark);
    const existingAddress = address ? address.trim() : "";
    const isGenericAddress =
      !existingAddress ||
      existingAddress.toLowerCase().startsWith("pin location near") ||
      existingAddress.toLowerCase().startsWith("near ward");

    if (isSpecific) {
      // Official landmark chosen: synchronize both field and location card with canonical landmark name
      setAddress(data.landmarkName);
      setSelectedLandmarkName(data.landmarkName);
      setLocationStatus(`Municipal GIS Landmark: ${data.landmarkName}`);
      if (errors.address) {
        setErrors((prev) => {
          const rest = { ...prev };
          delete rest.address;
          return rest;
        });
      }
    } else {
      // Arbitrary point selected on map (coordinates only)
      if (existingAddress && !isGenericAddress) {
        // Citizen already manually entered a custom landmark/address (e.g. "laxmi nagar, laxmeshwar")
        // Do NOT overwrite citizen's manually entered landmark!
        // Keep the location card consistent with citizen's landmark + map pin tag
        const cardLabel = targetWardCode
          ? `${existingAddress} (${targetWardCode} Map Pin)`
          : `${existingAddress} (Municipal Map Pin)`;
        setSelectedLandmarkName(cardLabel);
        setLocationStatus(`Municipal GIS Pin tagged for ${existingAddress}`);
      } else {
        // Address was empty or generic placeholder: set appropriately
        const pinAddress =
          data.landmarkName ||
          `Near ${targetWardCode || "Ward"}, Lakshmeshwar Municipal Area`;
        setAddress(pinAddress);
        setSelectedLandmarkName(pinAddress);
        setLocationStatus(`Municipal GIS Pin: ${pinAddress}`);
        if (errors.address) {
          setErrors((prev) => {
            const rest = { ...prev };
            delete rest.address;
            return rest;
          });
        }
      }
    }
  };

  // Photo Attachment Processor & Validator
  const validateAndProcessPhoto = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = fileExt && ["jpg", "jpeg", "png", "webp"].includes(fileExt);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setErrors((prev) => ({
        ...prev,
        photo: "Invalid image format. Please upload a JPG, PNG, or WebP photo.",
      }));
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "Photo attachment must be under 5MB.",
      }));
      return;
    }

    setPhotoName(file.name);
    setPhotoSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest.photo;
        return rest;
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndProcessPhoto(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoName(null);
    setPhotoSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.photo;
      return rest;
    });
  };

  const handleReplacePhoto = () => {
    fileInputRef.current?.click();
  };

  // AI Complaint Assistant: Generate suggestions using pluggable service / endpoint
  const handleRunAiAssistant = async (mode: "full" | "category" = "full") => {
    const rawInput = aiPromptInput.trim() || title.trim() || description.trim();
    if (!rawInput) {
      setAiError("Please describe your problem in simple language or choose a sample prompt.");
      return;
    }

    setIsAiProcessing(true);
    setAiError(null);
    setAiAppliedFields({ category: false, title: false, description: false });

    try {
      const res = await fetch("/api/complaints/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rawInput,
          currentTitle: title,
          currentDescription: description,
          currentCategory: category,
          ward: selectedWard,
          address: address,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setAiSuggestions(json.data);
      } else {
        // Fallback to local deterministic assistant
        const fallback = await generateComplaintSuggestions({
          prompt: rawInput,
          currentTitle: title,
          currentDescription: description,
          currentCategory: category,
          ward: selectedWard,
          address: address,
        });
        setAiSuggestions(fallback);
      }
    } catch {
      // Local fallback in case of network issue
      try {
        const fallback = await generateComplaintSuggestions({
          prompt: rawInput,
          currentTitle: title,
          currentDescription: description,
          currentCategory: category,
          ward: selectedWard,
          address: address,
        });
        setAiSuggestions(fallback);
      } catch {
        setAiError("Unable to generate suggestions. Please enter details manually.");
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Explicitly apply category suggestion (never automatically overwrites title or description)
  const handleApplySuggestedCategory = () => {
    if (!aiSuggestions?.suggestedCategory) return;
    setCategory(aiSuggestions.suggestedCategory);
    setAiAppliedFields((prev) => ({ ...prev, category: true }));
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.category;
      return rest;
    });
  };

  // Explicitly apply title suggestion (never automatically overwrites category or description)
  const handleApplySuggestedTitle = () => {
    if (!aiSuggestions?.suggestedTitle) return;
    setTitle(aiSuggestions.suggestedTitle);
    setAiAppliedFields((prev) => ({ ...prev, title: true }));
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.title;
      return rest;
    });
  };

  // Explicitly apply description suggestion (never automatically overwrites category or title)
  const handleApplySuggestedDescription = () => {
    if (!aiSuggestions?.suggestedDescription) return;
    setDescription(aiSuggestions.suggestedDescription);
    setAiAppliedFields((prev) => ({ ...prev, description: true }));
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.description;
      return rest;
    });
  };

  // Explicitly apply all suggestions together
  const handleApplyAllAiSuggestions = () => {
    if (!aiSuggestions) return;
    if (aiSuggestions.suggestedCategory) setCategory(aiSuggestions.suggestedCategory);
    if (aiSuggestions.suggestedTitle) setTitle(aiSuggestions.suggestedTitle);
    if (aiSuggestions.suggestedDescription) setDescription(aiSuggestions.suggestedDescription);
    setAiAppliedFields({ category: true, title: true, description: true });
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.category;
      delete rest.title;
      delete rest.description;
      return rest;
    });
  };

  // Clear suggestions
  const handleClearAiSuggestions = () => {
    setAiSuggestions(null);
    setAiError(null);
    setAiAppliedFields({ category: false, title: false, description: false });
  };

  // Legacy helper
  const handleApplyAiSuggestion = () => {
    handleApplyAllAiSuggestions();
  };

  // Validation before Review
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!category.trim()) {
      newErrors.category = "Please select a municipal complaint category.";
    }

    if (!title.trim()) {
      newErrors.title = "Please provide a descriptive subject or title.";
    } else if (title.trim().length < 3) {
      newErrors.title = "Subject must be at least 3 characters long.";
    } else if (title.trim().length > 255) {
      newErrors.title = "Subject exceeds maximum limit of 255 characters.";
    }

    if (!description.trim()) {
      newErrors.description = "Please describe the civic issue in detail.";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long.";
    }

    if (!selectedWard.trim()) {
      newErrors.ward = "Please select the TMC Ward jurisdiction.";
    }

    if (!address.trim()) {
      newErrors.address = "Please provide the specific street address or landmark.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move from Step 1 (Form) to Step 2 (Review)
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (validateForm()) {
      // Auto-save draft on proceeding to review
      handleSaveDraft();
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Submit Final Reviewed Form to Backend API
  const handleSubmitGrievance = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        category: category.trim(),
        title: title.trim(),
        description: description.trim(),
        ward: selectedWard.trim(),
        address: address.trim(),
        latitude: latitude,
        longitude: longitude,
        photoUrl: photoPreview || null,
        priority: priority,
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setSubmitError(json.error || "Failed to register complaint with Lakshmeshwar TMC.");
        setIsSubmitting(false);
        return;
      }

      // Complaint created successfully
      setSubmittedComplaint(json.data);
      setCurrentStep(3); // Step 3: Confirmation
      // Clean up local draft upon successful registration
      try {
        localStorage.removeItem("civsetu_complaint_draft");
      } catch {
        // ignore
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network communication error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Complaint ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Department calculation helper for review screen
  const getAssignedDepartment = (catName: string) => {
    const item = COMPLAINT_CATEGORIES.find((c) => c.name === catName);
    return item ? item.department : "Lakshmeshwar TMC Citizen Facilitation Centre";
  };

  // Calculate SLA hours
  const selectedPriorityMeta = PRIORITIES.find((p) => p.level === priority) || PRIORITIES[1];

  // ---------------------------------------------------------------------------
  // 1. Loading State
  // ---------------------------------------------------------------------------
  if (authLoading) {
    return (
      <PageContainer
        title="Lodge Citizen Grievance"
        subtitle="Lakshmeshwar Town Municipal Council Public Redressal"
        breadcrumbs={[{ label: "Citizen Portal", href: "/dashboard" }, { label: "Register Grievance" }]}
      >
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <RefreshCw className="w-9 h-9 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Verifying Citizen Authentication...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Securely validating your active Lakshmeshwar citizen session credentials.
          </p>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Unauthenticated Gate
  // ---------------------------------------------------------------------------
  if (!isAuthenticated || !citizen) {
    return (
      <PageContainer
        title="Lodge Citizen Grievance"
        subtitle="Official Public Redressal & Civic Issue Dispatch"
        breadcrumbs={[{ label: "Citizen Portal", href: "/dashboard" }, { label: "Register Grievance" }]}
      >
        <div className="max-w-md mx-auto py-8">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Citizen Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                To prevent fraudulent submissions and guarantee official government accountability with tracked SLA timelines, you must be signed in to lodge an official complaint.
              </p>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-left text-xs text-[#064E4A] dark:text-teal-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Protected Civic Redressal Benefits:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-gray-700 dark:text-gray-300 ml-1">
                <li>Automated assignment to Lakshmeshwar ward engineers</li>
                <li>Legally binding SLA resolution clock (24h - 120h)</li>
                <li>Live SMS & status updates on your citizen dashboard</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="bg-[#064E4A] hover:bg-[#0B6B63] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Sign In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Authenticated Grievance Form & Workflow
  // ---------------------------------------------------------------------------
  return (
    <PageContainer
      title="Lodge Citizen Grievance"
      subtitle="Lakshmeshwar Town Municipal Council - Public Service Redressal & Dispatch"
      breadcrumbs={[
        { label: "Citizen Portal", href: "/dashboard" },
        { label: "Register Grievance" },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Progress Header */}
        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  currentStep === 1
                    ? "bg-[#064E4A] text-white ring-4 ring-teal-100 dark:ring-teal-900"
                    : currentStep > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Grievance Details</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Fill issue information</p>
              </div>
            </div>

            <div
              className={`flex-1 h-0.5 mx-3 transition-colors ${
                currentStep >= 2 ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  currentStep === 2
                    ? "bg-[#064E4A] text-white ring-4 ring-teal-100 dark:ring-teal-900"
                    : currentStep > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Review & Verify</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Confirm submission</p>
              </div>
            </div>

            <div
              className={`flex-1 h-0.5 mx-3 transition-colors ${
                currentStep === 3 ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            {/* Step 3 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  currentStep === 3
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                3
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Official Receipt</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Tracking & SLA info</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Alert */}
        {submitError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Submission Error</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 1: FILL COMPLAINT FORM
           ===================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Citizen Context Banner */}
            <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#064E4A] text-white flex items-center justify-center font-bold text-sm">
                  {citizen.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    Lodge as: <span className="text-[#064E4A] dark:text-teal-300">{citizen.fullName}</span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                    Mobile: +91 {citizen.mobileNumber} | Registered Ward: {citizen.wardNumber || "TMC Area"}
                  </p>
                </div>
              </div>

              {/* Draft Status & Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {draftSavedTime && (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                    Draft saved: {draftSavedTime}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300 hover:text-[#064E4A] bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 transition"
                  title="Save in progress draft locally"
                >
                  Save Draft
                </button>
                {draftSavedTime && (
                  <button
                    type="button"
                    onClick={handleRestoreDraft}
                    className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleProceedToReview} noValidate className="space-y-6">
              {/* ===================================================================
                  AI COMPLAINT ASSISTANT (PREVIEW) - EXPANDABLE PANEL
                 =================================================================== */}
              <section
                id="ai-assistant-container"
                aria-label="AI Complaint Assistant"
                className="rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-gradient-to-b from-teal-50/70 via-white to-teal-50/40 dark:from-[#082622] dark:via-[#071f1d] dark:to-[#082622] p-4 sm:p-5 shadow-sm transition-all"
              >
                {/* Header & Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#064E4A] text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                          AI Complaint Assistant
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-[#064E4A] dark:bg-teal-900/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Preview
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Describe your issue in simple words — get suggested title, description, category, and missing details
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="ai-assistant-toggle"
                    aria-expanded={aiAssistantOpen}
                    aria-controls="ai-assistant-panel"
                    onClick={() => setAiAssistantOpen((prev) => !prev)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-800 text-[#064E4A] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <span>{aiAssistantOpen ? "Collapse" : "Open Assistant"}</span>
                    {aiAssistantOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expandable Body */}
                {aiAssistantOpen && (
                  <div id="ai-assistant-panel" className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-800/60 space-y-4">
                    {/* Sample Quick Prompt Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Try a sample problem prompt:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Water pipe burst near Someshwara Temple flooding the road",
                          "Streetlights not working for 3 days near bus stop",
                          "Garbage bin overflowing with bad smell near vegetable market",
                          "Deep pothole and broken drain slab causing traffic hazard",
                          "Stagnant dirty water and heavy mosquito breeding in lane",
                        ].map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAiPromptInput(sample);
                              if (aiError) setAiError(null);
                            }}
                            className="text-[11px] px-2.5 py-1 bg-white dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#064E4A] dark:hover:text-teal-300 rounded-full border border-gray-200 dark:border-gray-700 transition"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Citizen Problem Input */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="ai-prompt-input"
                        className="block text-xs font-bold text-gray-800 dark:text-gray-200"
                      >
                        Describe your problem in simple language:
                      </label>
                      <textarea
                        id="ai-prompt-input"
                        rows={3}
                        value={aiPromptInput}
                        onChange={(e) => {
                          setAiPromptInput(e.target.value);
                          if (aiError) setAiError(null);
                        }}
                        placeholder="e.g., Drinking water pipe broke near Someshwara Temple, water flooding on road since yesterday morning..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#064E4A] dark:focus:ring-teal-400 transition"
                      />
                    </div>

                    {/* Actions: Improve My Complaint & Suggest Category */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        id="btn-ai-improve"
                        onClick={() => handleRunAiAssistant("full")}
                        disabled={isAiProcessing || !aiPromptInput.trim()}
                        className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                      >
                        {isAiProcessing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Improving Complaint...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Improve My Complaint</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id="btn-ai-category"
                        onClick={() => handleRunAiAssistant("category")}
                        disabled={isAiProcessing || !aiPromptInput.trim()}
                        className="px-3.5 py-2 border border-teal-300 dark:border-teal-700 bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-[#064E4A] dark:text-teal-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Suggest Category</span>
                      </button>

                      {aiSuggestions && (
                        <button
                          type="button"
                          onClick={handleClearAiSuggestions}
                          className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline transition ml-auto"
                        >
                          Clear Suggestions
                        </button>
                      )}
                    </div>

                    {/* Loading State */}
                    {isAiProcessing && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center gap-2.5 text-xs text-[#064E4A] dark:text-teal-300"
                      >
                        <RefreshCw className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <span>Analyzing grievance keywords and formatting official municipal draft...</span>
                      </div>
                    )}

                    {/* Error Alert */}
                    {aiError && (
                      <div
                        role="alert"
                        className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300"
                      >
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{aiError}</span>
                      </div>
                    )}

                    {/* Suggestions Display */}
                    {aiSuggestions && !isAiProcessing && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="p-4 bg-white dark:bg-[#06201e] rounded-xl border border-teal-200 dark:border-teal-800/80 space-y-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-xs font-bold text-[#064E4A] dark:text-teal-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>AI Assistance (Preview) Suggestions</span>
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            Deterministic Local Assistant
                          </span>
                        </div>

                        {/* 1. Category Suggestion */}
                        <div className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Suggested Category:
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                                {aiSuggestions.suggestedCategory}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {aiSuggestions.suggestedCategoryConfidence === "high" ? "High Match" : "Good Match"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleApplySuggestedCategory}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 self-start sm:self-center ${
                              aiAppliedFields.category || category === aiSuggestions.suggestedCategory
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-default"
                                : "bg-[#064E4A] hover:bg-[#0B6B63] text-white shadow-xs"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {aiAppliedFields.category || category === aiSuggestions.suggestedCategory
                                ? "Category Applied"
                                : "Use Suggested Category"}
                            </span>
                          </button>
                        </div>

                        {/* 2. Title Suggestion */}
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Suggested Title:
                            </span>
                            <button
                              type="button"
                              onClick={handleApplySuggestedTitle}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                                aiAppliedFields.title || title === aiSuggestions.suggestedTitle
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-default"
                                  : "bg-[#064E4A] hover:bg-[#0B6B63] text-white shadow-xs"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {aiAppliedFields.title || title === aiSuggestions.suggestedTitle
                                  ? "Title Applied"
                                  : "Use Suggested Title"}
                              </span>
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {aiSuggestions.suggestedTitle}
                          </p>
                        </div>

                        {/* 3. Description Suggestion */}
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Improved Description:
                            </span>
                            <button
                              type="button"
                              onClick={handleApplySuggestedDescription}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                                aiAppliedFields.description || description === aiSuggestions.suggestedDescription
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-default"
                                  : "bg-[#064E4A] hover:bg-[#0B6B63] text-white shadow-xs"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {aiAppliedFields.description || description === aiSuggestions.suggestedDescription
                                  ? "Description Applied"
                                  : "Use Suggested Description"}
                              </span>
                            </button>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto pr-1">
                            {aiSuggestions.suggestedDescription}
                          </p>
                        </div>

                        {/* 4. Missing Information / Questions to Consider */}
                        {aiSuggestions.missingInformation && aiSuggestions.missingInformation.length > 0 && (
                          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              <span>Details that could improve your complaint:</span>
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-900 dark:text-amber-200 ml-1">
                              {aiSuggestions.missingInformation.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bulk Action & Privacy Reassurance */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                            AI Assistance (Preview): Suggestions will never overwrite your fields unless you click the buttons above.
                          </p>
                          <button
                            type="button"
                            onClick={handleApplyAllAiSuggestions}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 self-end sm:self-auto"
                          >
                            <Check className="w-4 h-4" />
                            <span>Apply All Suggestions</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Section 1: Complaint Category */}
              <div id="field-category" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    1. Select Municipal Department / Issue Category <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Determines assigned Lakshmeshwar TMC engineering wing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMPLAINT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.name);
                          setErrors((prev) => {
                            const rest = { ...prev };
                            delete rest.category;
                            return rest;
                          });
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? "border-[#064E4A] dark:border-teal-400 bg-teal-50/60 dark:bg-teal-950/40 ring-2 ring-[#064E4A] dark:ring-teal-400/40"
                            : "border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-[#071d1b]"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-[#064E4A] text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.category && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.category}</span>
                  </p>
                )}
              </div>

              {/* Section 2: Priority & SLA Guarantee */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    2. Grievance Urgency & SLA Resolution Guarantee
                  </label>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Target SLA: {selectedPriorityMeta.slaHours} Hours
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => {
                    const isSelected = priority === p.level;
                    return (
                      <button
                        key={p.level}
                        type="button"
                        onClick={() => setPriority(p.level)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-[#064E4A] dark:border-teal-400 bg-teal-50 dark:bg-teal-950/40 ring-1 ring-[#064E4A] dark:ring-teal-400 font-bold"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-gray-300 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{p.level}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {p.slaHours}h SLA
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                  {selectedPriorityMeta.description}
                </p>
              </div>

              {/* Section 3: Subject & AI Polish */}
              <div id="field-title" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="complaint-title" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    3. Complaint Subject / Title <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {/* AI Assistant Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAiAssistantOpen(true);
                        const el = document.getElementById("ai-assistant-container");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#064E4A] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 transition focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                      title="Open Civic AI Assistant"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AI Assistant (Preview)</span>
                    </button>
                    <span className="text-[11px] text-gray-400">
                      {title.length}/255
                    </span>
                  </div>
                </div>

                <input
                  id="complaint-title"
                  type="text"
                  maxLength={255}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      setErrors((prev) => {
                        const rest = { ...prev };
                        delete rest.title;
                        return rest;
                      });
                    }
                  }}
                  placeholder="e.g., Major drinking water pipeline burst outside Someshwara Temple"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-gray-800 focus:outline-none transition ${
                    errors.title
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                  }`}
                />

                {errors.title && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Section 4: Description */}
              <div id="field-description" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="complaint-desc" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    4. Detailed Grievance Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    {description.length} characters (min 10)
                  </span>
                </div>

                <textarea
                  id="complaint-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) {
                      setErrors((prev) => {
                        const rest = { ...prev };
                        delete rest.description;
                        return rest;
                      });
                    }
                  }}
                  placeholder="Please specify exact details: What is happening? When did it start? What is the impact on residents, pedestrians, or traffic? Has any preliminary notice been given to ward staff?"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-gray-800 focus:outline-none transition ${
                    errors.description
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                  }`}
                />

                {errors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>

              {/* Section 5: Ward & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ward Selection */}
                <div id="field-ward" className="space-y-2">
                  <label htmlFor="complaint-ward" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    5. Ward Jurisdiction <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="complaint-ward"
                    value={selectedWard}
                    onChange={(e) => {
                      const newWard = e.target.value;
                      setSelectedWard(newWard);
                      // If on a map pin with a manual address, update card ward tag
                      if (locationCaptured && locationMethod === "map" && address.trim()) {
                        const wardTag = newWard ? ` (${newWard} Map Pin)` : " (Municipal Map Pin)";
                        setSelectedLandmarkName(`${address.trim()}${wardTag}`);
                      }
                      if (errors.ward) {
                        setErrors((prev) => {
                          const rest = { ...prev };
                          delete rest.ward;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-gray-800 focus:outline-none transition ${
                      errors.ward
                        ? "border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                    }`}
                  >
                    <option value="">-- Select Lakshmeshwar Ward --</option>
                    {wardsData.map((w) => (
                      <option
                        key={w.wardNumber}
                        value={`Ward ${String(w.wardNumber).padStart(2, "0")}`}
                      >
                        Ward {w.wardNumber} - {w.name}
                      </option>
                    ))}
                  </select>
                  {errors.ward && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.ward}</span>
                    </p>
                  )}
                </div>

                {/* Specific Location / Address */}
                <div id="field-address" className="space-y-2">
                  <label htmlFor="complaint-address" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    6. Incident Location / Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="complaint-address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      const newAddress = e.target.value;
                      setAddress(newAddress);
                      // If a map pin is active, keep the location card label consistent with the citizen's edited text
                      if (locationCaptured && locationMethod === "map") {
                        if (newAddress.trim()) {
                          const wardTag = selectedWard ? ` (${selectedWard} Map Pin)` : " (Municipal Map Pin)";
                          setSelectedLandmarkName(`${newAddress.trim()}${wardTag}`);
                        } else {
                          setSelectedLandmarkName(
                            selectedWard
                              ? `Pin Location near ${selectedWard}, Lakshmeshwar`
                              : "Lakshmeshwar Municipal GIS Pin"
                          );
                        }
                      }
                      if (errors.address) {
                        setErrors((prev) => {
                          const rest = { ...prev };
                          delete rest.address;
                          return rest;
                        });
                      }
                    }}
                    placeholder="e.g., Near Someshwara Temple Main Gate, Station Road"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white dark:bg-gray-800 focus:outline-none transition ${
                      errors.address
                        ? "border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Section 6: Incident Location & Geotagging */}
              <div
                id="field-location"
                className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                        Add Incident Location (GPS or Municipal Map)
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Attaching coordinates enables immediate municipal dispatch routing to the site.
                    </p>
                  </div>

                  {/* Actions: Geolocation + Map Picker */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      disabled={isLocating}
                      aria-label="Use Current Location using device GPS"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-lg transition shadow-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#064E4A]"
                    >
                      {isLocating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Acquiring GPS...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-teal-300" />
                          <span>Use Current Location</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMapPickerOpen(true)}
                      aria-label="Pick location on Lakshmeshwar Municipal Map"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 text-xs font-bold rounded-lg transition shadow-sm focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#064E4A]"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                      <span>Pick on Municipal Map</span>
                    </button>
                  </div>
                </div>

                {/* Error Alert Message */}
                {locationError && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{locationError}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setMapPickerOpen(true)}
                          className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold rounded-md text-[11px] hover:bg-amber-300 transition"
                        >
                          Open Municipal Map Instead
                        </button>
                        <button
                          type="button"
                          onClick={handleUseMunicipalCenter}
                          className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold rounded-md text-[11px] hover:underline"
                        >
                          Use Lakshmeshwar Center (15.1245°N, 75.4744°E)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Geotagged Success Card */}
                {locationCaptured ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">
                              {locationMethod === "map"
                                ? "Municipal Map Pin Selected"
                                : "Device Location Tagged Successfully"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold">
                              {locationMethod === "map" ? "Map Tagged" : "GPS Tagged"}
                            </span>
                          </div>

                          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                            {selectedLandmarkName
                              ? selectedLandmarkName
                              : "Lakshmeshwar Municipal Zone GIS reference recorded."}
                          </p>

                          {/* Accuracy with actual browser-reported accuracy */}
                          {locationAccuracy !== null && (
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                              Device Accuracy: <span className="font-semibold text-emerald-700 dark:text-emerald-300">±{locationAccuracy}m</span> reported by sensor
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowCoordinatesDetail(!showCoordinatesDetail)}
                          aria-label={showCoordinatesDetail ? "Hide coordinates" : "Show coordinates"}
                          className="inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 hover:underline"
                        >
                          {showCoordinatesDetail ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hide Raw GPS</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>View Raw GPS</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleClearLocation}
                          aria-label="Clear recorded location"
                          className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Privacy Note & Expandable Exact Coordinates */}
                    <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 gap-1">
                      <p className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-emerald-600" />
                        <span>Coordinates are protected for citizen privacy and shared solely with municipal crews.</span>
                      </p>
                      {showCoordinatesDetail && latitude !== null && longitude !== null && (
                        <p className="font-mono text-[11px] text-gray-700 dark:text-gray-300 bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
                          {latitude.toFixed(6)}° N, {longitude.toFixed(6)}° E
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    You may use your device GPS or select your spot on the municipal map. If skipped, dispatch will route using the ward and landmark address.
                  </p>
                )}
              </div>

              {/* Section 7: Photographic Evidence Upload */}
              <div id="field-photo" className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="complaint-photo-input" className="block text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                    7. Photographic Evidence (Optional, max 5MB)
                  </label>
                  <span id="photo-format-hint" className="text-[11px] text-gray-500 dark:text-gray-400">
                    JPG, PNG, WebP supported
                  </span>
                </div>

                {!photoPreview ? (
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="Upload photo evidence. Click or press Enter to browse files, or drag and drop here."
                    aria-describedby="photo-format-hint"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(true);
                    }}
                    onDragLeave={() => setIsDraggingPhoto(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPhoto(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) validateAndProcessPhoto(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064E4A] ${
                      isDraggingPhoto
                        ? "border-[#064E4A] bg-teal-50 dark:bg-teal-950/40"
                        : "border-gray-300 dark:border-gray-700 hover:border-[#064E4A] dark:hover:border-teal-400 bg-white dark:bg-gray-800/40"
                    }`}
                  >
                    <input
                      id="complaint-photo-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handlePhotoSelect}
                      className="sr-only"
                    />
                    <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                      Click to upload photo evidence, take a picture, or drag file here
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      Clear photos of pipe leakages, garbage dumps, or potholes accelerate municipal triage.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <input
                      id="complaint-photo-input"
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handlePhotoSelect}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => setPhotoModalOpen(true)}
                        aria-label="View enlarged evidence photo"
                        className="relative group rounded-lg overflow-hidden flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064E4A]"
                      >
                        <img
                          src={photoPreview}
                          alt="Grievance evidence preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 group-hover:opacity-90 transition"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                          {photoName}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          File Size: {photoSize}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo ready for municipal attachment</span>
                        </span>
                      </div>
                    </div>

                    {/* Photo Actions: Replace, View, Remove */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setPhotoModalOpen(true)}
                        aria-label="View enlarged image"
                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={handleReplacePhoto}
                        aria-label="Replace current photo"
                        className="px-2.5 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/40 text-xs font-bold text-[#064E4A] dark:text-teal-200 hover:bg-teal-100 transition"
                      >
                        Replace
                      </button>

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        aria-label="Remove attached photo"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 transition"
                        title="Remove attached photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {errors.photo && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.photo}</span>
                  </p>
                )}
              </div>

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-center transition"
                >
                  Cancel & Return to Dashboard
                </Link>

                <div className="w-full sm:w-auto flex items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold text-sm rounded-xl transition shadow hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Review Complaint</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================================
            STEP 2: REVIEW COMPLAINT BEFORE SUBMISSION
           ===================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold text-sm">Step 2: Review Before Official Registration</p>
                <p className="mt-0.5 leading-relaxed">
                  Please verify all grievance information carefully. Upon submission, an official immutable tracking record will be registered in Lakshmeshwar Town Municipal Council records, and an escalation clock will initiate.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
              {/* Category & SLA Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Municipal Category
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                    {category}
                  </h3>
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold mt-0.5">
                    Assigned: {getAssignedDepartment(category)}
                  </p>
                </div>

                <div className="self-start sm:self-auto text-left sm:text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${selectedPriorityMeta.badgeClass}`}>
                    {priority} Priority
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SLA Guarantee: {selectedPriorityMeta.slaHours} Hours</span>
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    Complaint Subject / Title
                  </h4>
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {title}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    Detailed Grievance Description
                  </h4>
                  <div className="mt-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {description}
                  </div>
                </div>
              </div>

              {/* Location & GPS Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                  <p className="font-bold text-gray-500 dark:text-gray-400 text-[11px] uppercase">
                    Ward Jurisdiction
                  </p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {selectedWard}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                    Lakshmeshwar Town Municipal Council Area
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5">
                  <p className="font-bold text-gray-500 dark:text-gray-400 text-[11px] uppercase">
                    Incident Landmark / Address
                  </p>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {address}
                  </p>
                  {locationCaptured ? (
                    <div className="space-y-1">
                      <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {locationMethod === "map" ? "Municipal Map Pin" : "GPS Tag Recorded"}
                          {locationAccuracy !== null ? ` (Accuracy: ±${locationAccuracy}m)` : ""}
                        </span>
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-0.5">
                        <span>Protected for citizen privacy</span>
                        <button
                          type="button"
                          onClick={() => setShowCoordinatesDetail(!showCoordinatesDetail)}
                          className="text-teal-700 dark:text-teal-400 hover:underline"
                        >
                          {showCoordinatesDetail ? "Hide Raw Lat/Lng" : "View Coordinates"}
                        </button>
                      </div>
                      {showCoordinatesDetail && latitude !== null && longitude !== null && (
                        <p className="font-mono text-[10px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">
                          {latitude}° N, {longitude}° E
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-[11px]">No GPS coordinates attached</p>
                  )}
                </div>
              </div>

              {/* Attached Evidence Preview (if any) */}
              {photoPreview && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Attached Photographic Evidence
                  </p>
                  <div className="inline-flex items-center gap-3.5 p-2.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPhotoModalOpen(true)}
                      aria-label="View enlarged evidence photo"
                      className="relative group rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={photoPreview}
                        alt="Grievance evidence"
                        className="w-16 h-16 object-cover rounded-lg group-hover:opacity-90 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </button>
                    <div className="text-xs pr-3">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{photoName}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">{photoSize}</p>
                      <button
                        type="button"
                        onClick={() => setPhotoModalOpen(true)}
                        className="text-[11px] text-[#064E4A] dark:text-teal-300 font-semibold hover:underline mt-1 block"
                      >
                        Click to view full image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filing Citizen Profile Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 bg-teal-50/40 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900">
                <p className="text-xs font-bold uppercase text-[#064E4A] dark:text-teal-300 tracking-wider mb-2">
                  Official Complainant Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Citizen Name</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{citizen.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Registered Mobile</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">+91 {citizen.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Email Address</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{citizen.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Step Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Complaint Details</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitGrievance}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold text-sm rounded-xl transition shadow hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering with Lakshmeshwar TMC...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-300" />
                    <span>Confirm & Submit Official Complaint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 3: SUBMISSION CONFIRMATION & OFFICIAL RECEIPT
           ===================================================================== */}
        {currentStep === 3 && submittedComplaint && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-emerald-600 text-white p-6 sm:p-8 rounded-2xl text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold">
                Grievance Registered Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
                Your complaint has been formally lodged with the Lakshmeshwar Town Municipal Council. The designated municipal engineering section has been notified.
              </p>
            </div>

            {/* Official Receipt Card */}
            <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Official Reference Tracking ID
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#064E4A] dark:text-teal-300">
                      {submittedComplaint.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(submittedComplaint.id)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
                      title="Copy Tracking ID"
                    >
                      {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="self-start sm:self-auto text-left sm:text-right space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Status: {submittedComplaint.status || "Submitted"}
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Level: {submittedComplaint.authorityLevel || "Local Authority"}
                  </p>
                </div>
              </div>

              {/* Resolution SLA & Routing Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-1.5">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Assigned Municipal Section
                  </p>
                  <p className="font-bold text-[#064E4A] dark:text-teal-200">
                    {submittedComplaint.assignedAuthority}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Jurisdiction: {submittedComplaint.ward}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Guaranteed SLA Resolution Deadline
                  </p>
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    {submittedComplaint.deadline
                      ? new Date(submittedComplaint.deadline).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : `${selectedPriorityMeta.slaHours} Hours`}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Automatic escalation if unaddressed within SLA window.
                  </p>
                </div>
              </div>

              {/* Receipt Summary Table */}
              <div className="space-y-2 text-xs">
                <p className="font-bold uppercase tracking-wider text-gray-400 text-[11px]">
                  Summary of Lodged Grievance
                </p>
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="flex p-3">
                    <span className="w-1/3 text-gray-500 dark:text-gray-400">Subject</span>
                    <span className="w-2/3 font-semibold text-gray-900 dark:text-gray-100">{submittedComplaint.title}</span>
                  </div>
                  <div className="flex p-3">
                    <span className="w-1/3 text-gray-500 dark:text-gray-400">Category</span>
                    <span className="w-2/3 text-gray-800 dark:text-gray-200">{submittedComplaint.category}</span>
                  </div>
                  <div className="flex p-3">
                    <span className="w-1/3 text-gray-500 dark:text-gray-400">Location</span>
                    <span className="w-2/3 text-gray-800 dark:text-gray-200">{submittedComplaint.address || address}</span>
                  </div>
                  <div className="flex p-3">
                    <span className="w-1/3 text-gray-500 dark:text-gray-400">Complainant</span>
                    <span className="w-2/3 text-gray-800 dark:text-gray-200">{citizen.fullName} (+91 {citizen.mobileNumber})</span>
                  </div>
                </div>
              </div>

              {/* Next Steps Card */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs space-y-1.5">
                <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                  <span>Lakshmeshwar TMC Redressal Process:</span>
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-[11px] ml-1">
                  <li>Lakshmeshwar TMC junior engineer will conduct on-site inspection.</li>
                  <li>Status updates will be logged on the audit timeline accessible via Live Tracker.</li>
                  <li>You will receive SMS notifications at registered mobile number +91 {citizen.mobileNumber}.</li>
                </ul>
              </div>

              {/* Primary Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Acknowledgment</span>
                </button>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                  <Link
                    href={`/track?id=${encodeURIComponent(submittedComplaint.id)}`}
                    className="w-full sm:w-auto px-6 py-2.5 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700 hover:bg-teal-100 text-[#064E4A] dark:text-teal-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Track Live Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold transition shadow flex items-center justify-center"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Municipal Map Picker Modal (Self-contained, offline-capable, no Google API keys) */}
      <MunicipalMapPickerModal
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        onSelectLocation={handleMapLocationSelected}
        initialLat={latitude}
        initialLng={longitude}
      />

      {/* Photographic Evidence Lightbox Modal */}
      {photoModalOpen && photoPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo evidence preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPhotoModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#071f1d] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-sm">
                  {photoName || "Complaint Photo Evidence"}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Size: {photoSize} • Official Attachment Preview
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                aria-label="Close photo preview"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Image Preview */}
            <div className="p-4 flex items-center justify-center bg-neutral-900 overflow-auto max-h-[70vh]">
              <img
                src={photoPreview}
                alt="Enlarged grievance evidence"
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Evidence Attachment</span>
              </span>

              <div className="flex items-center gap-2">
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoModalOpen(false);
                      handleReplacePhoto();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#064E4A] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition"
                  >
                    Replace Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="px-4 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-lg transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
