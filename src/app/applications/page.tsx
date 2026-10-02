"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/UI/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { wardsData } from "@/data/wards";
import {
  FileText,
  Download,
  CheckCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Upload,
  Clock,
  Shield,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  FileCheck,
  Printer,
  Copy,
  Check,
  X,
  PlusCircle,
  Briefcase,
  HelpCircle,
  Droplets,
  Trash2,
  Landmark,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";

export interface ServiceFormDef {
  id: string;
  formNo: string;
  title: string;
  category: string;
  department: string;
  sla: string;
  fee: string;
  description: string;
  pdfUrl: string;
  requiredDocuments: {
    id: string;
    name: string;
    description: string;
    mandatory: boolean;
  }[];
  customFields?: {
    id: string;
    label: string;
    placeholder: string;
    type: "text" | "select" | "number";
    options?: string[];
    required: boolean;
  }[];
}

const SERVICE_FORMS: ServiceFormDef[] = [
  {
    id: "water",
    formNo: "Form TMC-W1",
    title: "Application for Piped Drinking Water Connection",
    category: "Water Services",
    department: "Water Supply & Engineering Section",
    sla: "7 Working Days",
    fee: "₹500 Application Fee + Meter Deposit",
    description:
      "Permanent domestic or commercial piped drinking water connection from the Lakshmeshwar municipal distribution grid.",
    pdfUrl: "/forms/tmc-w1-water-connection.pdf",
    requiredDocuments: [
      {
        id: "tax_receipt",
        name: "Latest Property Tax Paid Receipt",
        description: "Current financial year municipal tax receipt",
        mandatory: true,
      },
      {
        id: "title_deed",
        name: "Sale Deed or E-Swathu Khata Extract (Form-3)",
        description: "Registered ownership or occupancy document",
        mandatory: true,
      },
      {
        id: "aadhaar",
        name: "Aadhaar Card of Property Owner",
        description: "Self-attested identity proof",
        mandatory: true,
      },
      {
        id: "pipe_sketch",
        name: "Plumber Route Sketch & Connection Layout",
        description: "Certified municipal plumber connection route sketch",
        mandatory: false,
      },
    ],
    customFields: [
      {
        id: "connectionType",
        label: "Connection Type",
        placeholder: "Select connection type",
        type: "select",
        options: ["Residential Domestic (0.5 inch)", "Commercial Establishment (0.75 inch)", "Industrial Bulk (1 inch)"],
        required: true,
      },
      {
        id: "existingMeterNo",
        label: "Nearby Municipal Tap / Neighbor Water Meter No",
        placeholder: "e.g. MTR-03-4412",
        type: "text",
        required: false,
      },
    ],
  },
  {
    id: "drainage",
    formNo: "Form TMC-SAN2",
    title: "Underground Drainage (UGD) Connection Authorization",
    category: "Sanitation & Drainage",
    department: "Public Health & Sanitation Section",
    sla: "7 Working Days",
    fee: "₹1,500 Connection Fee + Restoration Deposit",
    description:
      "Statutory approval for connecting residential or commercial sewerage lines to Lakshmeshwar municipal underground drainage pipeline.",
    pdfUrl: "/forms/tmc-san2-ugd-connection.pdf",
    requiredDocuments: [
      {
        id: "tax_receipt",
        name: "Property Tax Clearance Certificate",
        description: "Current year tax clearance certificate",
        mandatory: true,
      },
      {
        id: "site_plan",
        name: "Building Sanction Plan & Internal Drainage Diagram",
        description: "Approved floor plan showing sanitary outlets",
        mandatory: true,
      },
      {
        id: "aadhaar",
        name: "Aadhaar Card of Applicant",
        description: "Owner identity proof",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "pipeDiameter",
        label: "Requested Pipe Hookup Diameter",
        placeholder: "Select diameter",
        type: "select",
        options: ["110 mm PVC Standard Domestic", "160 mm Commercial High Discharge"],
        required: true,
      },
    ],
  },
  {
    id: "building",
    formNo: "Form TMC-BP4",
    title: "Building Construction Permission / Plan Sanction",
    category: "Town Planning",
    department: "Town Planning & Building Sanction Wing",
    sla: "14 Working Days",
    fee: "Calculated as per built-up area and FAR slab",
    description:
      "Statutory building approval for new residential construction, commercial expansion, or compound wall erection within municipal town limits.",
    pdfUrl: "/forms/tmc-bp4-building-permission.pdf",
    requiredDocuments: [
      {
        id: "title_deed",
        name: "Registered Sale Deed / Title Documents",
        description: "Clear ownership title with 30 years tracing",
        mandatory: true,
      },
      {
        id: "khata",
        name: "E-Swathu Khata Extract (Form-3)",
        description: "Digitally certified Form-3 property extract",
        mandatory: true,
      },
      {
        id: "arch_drawing",
        name: "Architectural Drawings & Site Plan (Blue Print)",
        description: "Prepared by licensed structural engineer / architect",
        mandatory: true,
      },
      {
        id: "ec_certificate",
        name: "Encumbrance Certificate (EC Form 15) for 13 Years",
        description: "Sub-registrar office verified EC certificate",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "plotArea",
        label: "Total Plot Area (Square Feet)",
        placeholder: "e.g. 1200",
        type: "number",
        required: true,
      },
      {
        id: "buildingType",
        label: "Proposed Construction Nature",
        placeholder: "Select construction type",
        type: "select",
        options: ["Residential G+1", "Residential G+2", "Commercial Complex", "Mixed Residential & Retail"],
        required: true,
      },
    ],
  },
  {
    id: "trade",
    formNo: "Form TMC-TL2",
    title: "Trade License Application & Annual Renewal",
    category: "Commercial & Business",
    department: "Trade Licensing & Commercial Cell",
    sla: "7 Working Days",
    fee: "₹500 to ₹3,000 based on trade category",
    description:
      "Statutory municipal business license to operate retail shops, restaurants, small industries, or healthcare clinics under Karnataka Municipalities Act.",
    pdfUrl: "/forms/tmc-tl2-trade-license.pdf",
    requiredDocuments: [
      {
        id: "shop_rent",
        name: "Rental Agreement or Property Tax Receipt of Shop",
        description: "Premises occupancy verification document",
        mandatory: true,
      },
      {
        id: "id_proof",
        name: "Aadhaar Card or PAN Card of Proprietor",
        description: "Business owner identity proof",
        mandatory: true,
      },
      {
        id: "fssai",
        name: "FSSAI Food Safety Certificate (if food establishment)",
        description: "Mandatory for hotels, bakeries, and eateries",
        mandatory: false,
      },
      {
        id: "shop_photo",
        name: "Shop Front Photo with Bilingual Kannada/English Nameboard",
        description: "Photo showing trade name and front entrance",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "tradeName",
        label: "Business / Commercial Establishment Name",
        placeholder: "e.g. Sri Someshwara Handloom Stores",
        type: "text",
        required: true,
      },
      {
        id: "tradeCategory",
        label: "Nature of Business Trade",
        placeholder: "Select trade category",
        type: "select",
        options: [
          "Retail Grocery & Provisions",
          "Textiles, Handloom & Apparel",
          "Restaurant, Bakery & Food Services",
          "Automobile Spares & Repair Workshop",
          "Medical Store & Pharmacy",
          "Hardware, Electrical & Construction Material",
        ],
        required: true,
      },
    ],
  },
  {
    id: "khata",
    formNo: "Form TMC-KT3",
    title: "Application for Khata Transfer / Extract (Sasya)",
    category: "Property & Revenue",
    department: "Town Revenue & Khata Department",
    sla: "15 Working Days",
    fee: "₹125 per certified extract copy",
    description:
      "Ownership name mutation, property division, or digital E-Swathu Form-3 certified extract for registration, banking, and municipal tax assessment.",
    pdfUrl: "/forms/tmc-kt3-khata-transfer.pdf",
    requiredDocuments: [
      {
        id: "registered_deed",
        name: "Registered Sale Deed / Gift Deed / Will Copy",
        description: "Sub-registrar authenticated deed",
        mandatory: true,
      },
      {
        id: "tax_receipt",
        name: "Latest Property Tax Paid Receipt",
        description: "Current tax year receipt with no arrears",
        mandatory: true,
      },
      {
        id: "ec_certificate",
        name: "13-Year Encumbrance Certificate (EC Form 15)",
        description: "Issued by Sub-Registrar Office",
        mandatory: true,
      },
      {
        id: "site_photo",
        name: "Latest Site / Building Photograph with GPS coordinates",
        description: "Clear photo showing front boundary",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "pidNumber",
        label: "Property Identification Number (PID / Assessment No)",
        placeholder: "e.g. 102-14-552",
        type: "text",
        required: true,
      },
      {
        id: "transferType",
        label: "Type of Khata Application",
        placeholder: "Select application type",
        type: "select",
        options: ["Transfer by Sale Deed", "Inheritance / Succession", "Gift Deed Mutation", "Bifurcation / Amalgamation"],
        required: true,
      },
    ],
  },
  {
    id: "noc",
    formNo: "Form TMC-NOC1",
    title: "No Objection Certificate (NOC) for Electricity / Borewell",
    category: "Engineering & Utilities",
    department: "Public Works & Electrical Section",
    sla: "5 Working Days",
    fee: "₹250 Statutory Inspection Fee",
    description:
      "Municipal clearance certificate required by HESCOM for new power meter connection or permission for drilling domestic drinking water borewell.",
    pdfUrl: "/forms/tmc-noc1-electricity-borewell.pdf",
    requiredDocuments: [
      {
        id: "tax_receipt",
        name: "Property Tax Clearance Certificate",
        description: "Tax clearance verification",
        mandatory: true,
      },
      {
        id: "hescom_note",
        name: "HESCOM Application Form or Feasibility Letter",
        description: "Electricity board power requirement document",
        mandatory: true,
      },
      {
        id: "aadhaar",
        name: "Aadhaar Card of Applicant",
        description: "Identity verification",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "nocPurpose",
        label: "Purpose of NOC",
        placeholder: "Select purpose",
        type: "select",
        options: ["HESCOM Commercial Power Meter Hookup", "HESCOM Domestic Power Hookup", "Domestic Borewell Drilling Permission"],
        required: true,
      },
    ],
  },
  {
    id: "street-vendor",
    formNo: "Form TMC-PM6",
    title: "Application for Street Vendor Registration (PM SVANidhi)",
    category: "Community Welfare",
    department: "Community Affairs & Social Welfare",
    sla: "7 Working Days",
    fee: "Free of Cost",
    description:
      "Official registration for urban hawkers, mobile pushcart sellers, and street vendors to obtain municipal vending certificates and collateral-free micro-credit.",
    pdfUrl: "/forms/tmc-pm6-street-vendor.pdf",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card of Street Vendor",
        description: "Identity verification document",
        mandatory: true,
      },
      {
        id: "voter_id",
        name: "Voter ID Card (EPIC)",
        description: "Lakshmeshwar constituency voter card",
        mandatory: true,
      },
      {
        id: "vendor_photo",
        name: "Photograph of Vendor with Mobile Pushcart / Vending Stall",
        description: "Color photo at usual vending spot",
        mandatory: true,
      },
      {
        id: "bank_passbook",
        name: "Bank Passbook with Aadhaar Seeding",
        description: "Active bank account details for credit subsidy",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "vendingType",
        label: "Vending Category",
        placeholder: "Select vending category",
        type: "select",
        options: ["Mobile Pushcart (Vegetables / Fruits)", "Stationary Roadside Stall", "Street Food / Tea Stall", "Handicrafts & Flowers"],
        required: true,
      },
      {
        id: "vendingLocation",
        label: "Usual Operating Street / Market Junction",
        placeholder: "e.g. Near Old Bus Stand, Someshwara Temple Road",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "hall-booking",
    formNo: "Form TMC-EST7",
    title: "Community Hall & Municipal Ground Public Booking",
    category: "Community & Culture",
    department: "Town Planning & Estate Management",
    sla: "2 Working Days",
    fee: "₹5,000/day + ₹2,000 Refundable Deposit",
    description:
      "Statutory advance booking for TMC Municipal Kalyana Mantapa, Open Exhibition Grounds, or Sports Pavilion for cultural and family events.",
    pdfUrl: "/forms/tmc-est7-hall-booking.pdf",
    requiredDocuments: [
      {
        id: "aadhaar",
        name: "Aadhaar Card of Event Organizer",
        description: "Identity verification",
        mandatory: true,
      },
      {
        id: "address_proof",
        name: "Local Residential Proof in Lakshmeshwar",
        description: "Voter ID or Electricity bill",
        mandatory: true,
      },
      {
        id: "undertaking",
        name: "Signed Noise & Plastic Ban Compliance Undertaking",
        description: "Agreement adhering to municipal sound decibel limits",
        mandatory: true,
      },
    ],
    customFields: [
      {
        id: "facilityName",
        label: "Municipal Facility to Book",
        placeholder: "Select facility",
        type: "select",
        options: ["TMC Community Kalyana Mantapa (Main Hall)", "Town Open Exhibition Ground", "Municipal Sports Pavilion"],
        required: true,
      },
      {
        id: "eventDate",
        label: "Proposed Event Date",
        placeholder: "DD/MM/YYYY",
        type: "text",
        required: true,
      },
    ],
  },
];

type StepType = "select_service" | "form" | "documents" | "review" | "submitted";

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { citizen, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepType>("select_service");
  const [selectedService, setSelectedService] = useState<ServiceFormDef | null>(null);

  // Search & Category Filters for Service Catalog
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Form Fields
  const [applicantName, setApplicantName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [address, setAddress] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");

  // Document Uploads State
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string; size: string }>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Declaration & Submission
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Auto-populate when citizen logs in
  useEffect(() => {
    if (citizen) {
      setApplicantName((prev) => prev || citizen.fullName);
      setMobileNumber((prev) => prev || citizen.mobileNumber);
      setEmail((prev) => prev || citizen.email);
      setWardNumber((prev) => prev || citizen.wardNumber);
      setAddress((prev) => prev || citizen.residentialAddress);
    }
  }, [citizen]);

  // Handle URL query parameter pre-selection
  useEffect(() => {
    const serviceParam = searchParams.get("service") || searchParams.get("form");
    if (serviceParam) {
      const match = SERVICE_FORMS.find(
        (f) =>
          f.id.toLowerCase() === serviceParam.toLowerCase() ||
          f.formNo.toLowerCase().includes(serviceParam.toLowerCase())
      );
      if (match) {
        setSelectedService(match);
        setCurrentStep("form");
      }
    }
  }, [searchParams]);

  const handleSelectService = (service: ServiceFormDef) => {
    setSelectedService(service);
    setUploadedDocs({});
    setCustomFieldValues({});
    setSubmitError(null);
    setCurrentStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCustomFieldChange = (fieldId: string, val: string) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !mobileNumber || !address) {
      setSubmitError("Please fill in applicant full name, mobile number, and address.");
      return;
    }
    setSubmitError(null);
    setCurrentStep("documents");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMockUpload = (docId: string, docName: string) => {
    // Generates a mock file attachment for testing statutory document compliance
    const mockFileSizes = ["420 KB", "1.2 MB", "650 KB", "890 KB"];
    const randomSize = mockFileSizes[Math.floor(Math.random() * mockFileSizes.length)];
    const cleanDocName = docName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);

    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        fileName: `${cleanDocName}_verified.pdf`,
        size: randomSize,
      },
    }));
    setUploadError(null);
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocs((prev) => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const handleDocumentsNext = () => {
    if (!selectedService) return;
    const mandatoryMissing = selectedService.requiredDocuments
      .filter((d) => d.mandatory)
      .some((d) => !uploadedDocs[d.id]);

    if (mandatoryMissing) {
      setUploadError("Please attach all mandatory statutory documents before proceeding to review.");
      return;
    }

    setUploadError(null);
    setCurrentStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!selectedService || !declared) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        serviceCode: selectedService.formNo,
        serviceName: selectedService.title,
        applicantName,
        mobileNumber,
        email: email || undefined,
        wardNumber: wardNumber || undefined,
        address,
        details: {
          department: selectedService.department,
          expectedSla: selectedService.sla,
          fee: selectedService.fee,
          applicantRemarks: remarks || "Standard municipal application filed via CivSetu portal",
          uploadedDocuments: Object.entries(uploadedDocs)
            .map(([id, d]) => `${id}: ${d.fileName}`)
            .join("; "),
          ...customFieldValues,
        },
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSubmittedAppId(json.data.id);
        setCurrentStep("submitted");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(json.error || "Failed to submit statutory application.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError("Failed to submit. Please check your network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = Array.from(new Set(SERVICE_FORMS.map((f) => f.category)));

  const filteredServices = SERVICE_FORMS.filter((f) => {
    const matchesSearch =
      !searchQuery.trim() ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer
      title="Citizen Services & Statutory Applications"
      subtitle="Complete multi-step municipal applications, upload verification documents, and track status live"
      breadcrumbs={[{ label: "Applications" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Progress Stepper Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
            {[
              { id: "select_service", label: "1. Select Service" },
              { id: "form", label: "2. Application Form" },
              { id: "documents", label: "3. Upload Documents" },
              { id: "review", label: "4. Review" },
              { id: "submitted", label: "5. Application ID" },
            ].map((step, idx) => {
              const stepOrder = ["select_service", "form", "documents", "review", "submitted"];
              const currentIdx = stepOrder.indexOf(currentStep);
              const thisIdx = stepOrder.indexOf(step.id);
              const isCompleted = thisIdx < currentIdx;
              const isActive = thisIdx === currentIdx;

              return (
                <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                      isActive
                        ? "bg-[#064E4A] text-white shadow-sm ring-2 ring-teal-200 dark:ring-teal-900"
                        : isCompleted
                        ? "bg-teal-50 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-300 font-semibold"
                        : "text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/40"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center bg-black/10 dark:bg-white/10">
                        {idx + 1}
                      </span>
                    )}
                    <span>{step.label}</span>
                  </div>
                  {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SELECT SERVICE                                                    */}
        {/* ========================================================================= */}
        {currentStep === "select_service" && (
          <div className="space-y-5">
            {/* Top Toolbar: Quick Track Link & Search / Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  Lakshmeshwar TMC Municipal Application Forms
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a municipal service to initiate a verified statutory application
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/track"
                  className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 hover:bg-teal-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Existing Application</span>
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    className="px-3.5 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-200 transition"
                  >
                    My Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Filter pills & Search bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by form number, service title, or department..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    categoryFilter === "ALL"
                      ? "bg-[#064E4A] text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  All Services ({SERVICE_FORMS.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      categoryFilter === cat
                        ? "bg-[#064E4A] text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {service.formNo}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500">
                          {service.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
                        <Clock className="w-3 h-3" />
                        <span>SLA: {service.sla}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-[#064E4A] dark:group-hover:text-teal-300 transition">
                      {service.title}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-1 text-[11px] text-gray-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                        <span>{service.department}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                        <span>Requires {service.requiredDocuments.length} verification documents</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <a
                      href={service.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition"
                      title="Download Offline Printable Form"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                      <span>Offline Form</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSelectService(service)}
                      className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <span>Start Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: APPLICATION FORM                                                  */}
        {/* ========================================================================= */}
        {currentStep === "form" && selectedService && (
          <form onSubmit={handleFormNext} className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[#064E4A] dark:text-teal-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {selectedService.formNo}
                      </span>
                      <span className="text-xs text-gray-500">{selectedService.department}</span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mt-0.5">
                      {selectedService.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep("select_service")}
                  className="text-xs text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1 self-start sm:self-center"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Service</span>
                </button>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Applicant Profile Particulars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                  <span>Applicant Particulars</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Statutory full name as per Aadhaar"
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Registered Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#064E4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="For digital confirmation copy"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Jurisdiction Ward *
                    </label>
                    <select
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                    >
                      <option value="">Select Ward</option>
                      {wardsData.map((w) => (
                        <option key={w.wardNumber} value={`Ward ${w.wardNumber}`}>
                          Ward {w.wardNumber} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Premises / Site Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Shop no., street name, landmark, Lakshmeshwar"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                  />
                </div>
              </div>

              {/* Service-Specific Custom Fields */}
              {selectedService.customFields && selectedService.customFields.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                    <span>Service Requirement Particulars</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedService.customFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {field.label} {field.required && "*"}
                        </label>
                        {field.type === "select" ? (
                          <select
                            value={customFieldValues[field.id] || ""}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            required={field.required}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={customFieldValues[field.id] || ""}
                            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Remarks */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes or Instructions
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Specify any relevant assessment particulars, tenant notes, or preferred inspection hours..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E4A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep("select_service")}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Services</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
                >
                  <span>Proceed to Upload Documents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: UPLOAD DOCUMENTS                                                  */}
        {/* ========================================================================= */}
        {currentStep === "documents" && selectedService && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Required Statutory Verification Documents
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Attach certified digital copies of all mandatory proofs for {selectedService.formNo}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {Object.keys(uploadedDocs).length} of {selectedService.requiredDocuments.length} Attached
                </span>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Document Checklist Items */}
            <div className="space-y-3">
              {selectedService.requiredDocuments.map((doc) => {
                const uploaded = uploadedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      uploaded
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                        : "bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          uploaded
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-400"
                        }`}
                      >
                        {uploaded ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                            {doc.name}
                          </h4>
                          {doc.mandatory ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {doc.description}
                        </p>
                        {uploaded && (
                          <div className="flex items-center gap-2 mt-1.5 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                            <span className="font-semibold">{uploaded.fileName}</span>
                            <span>•</span>
                            <span>{uploaded.size}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {uploaded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-semibold transition"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMockUpload(doc.id, doc.name)}
                          className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 hover:bg-teal-100 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Document</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep("form")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Particulars</span>
              </button>

              <button
                type="button"
                onClick={handleDocumentsNext}
                className="px-5 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
              >
                <span>Proceed to Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & CONFIRM                                                  */}
        {/* ========================================================================= */}
        {currentStep === "review" && selectedService && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Review Application Before Submission
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Verify your details carefully. A formal municipal tracking reference will be generated.
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {selectedService.formNo}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-[10px]">
                  Applied Service
                </h4>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{selectedService.title}</p>
                <p className="text-gray-500">{selectedService.department}</p>
                <p className="text-teal-700 dark:text-teal-300 font-semibold">Target SLA: {selectedService.sla}</p>
                <p className="text-gray-600 dark:text-gray-400">Prescribed Fee: {selectedService.fee}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-[10px]">
                  Applicant Information
                </h4>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{applicantName}</p>
                <p className="font-mono text-gray-700 dark:text-gray-300">+91 {mobileNumber}</p>
                {email && <p className="text-gray-500">{email}</p>}
                <p className="font-semibold text-gray-900 dark:text-gray-100">{wardNumber}</p>
                <p className="text-gray-600 dark:text-gray-400">{address}</p>
              </div>
            </div>

            {/* Custom fields & remarks summary */}
            {Object.keys(customFieldValues).length > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-[10px]">
                  Service Specific Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {Object.entries(customFieldValues).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, " $1")}: </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached documents list */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide text-[10px]">
                Attached Verification Documents ({Object.keys(uploadedDocs).length})
              </h4>
              <ul className="space-y-1.5 pt-1">
                {selectedService.requiredDocuments.map((doc) => {
                  const uploaded = uploadedDocs[doc.id];
                  return (
                    <li key={doc.id} className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{doc.name}</span>
                      {uploaded ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{uploaded.fileName}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not attached (Optional)</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 flex items-start gap-3 text-xs">
              <input
                type="checkbox"
                id="statutoryDeclaration"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 rounded text-[#064E4A] focus:ring-teal-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="statutoryDeclaration" className="cursor-pointer text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-bold text-[#064E4A] dark:text-teal-300">Statutory Municipal Declaration: </span>
                I hereby declare that all particulars entered and documents attached in this application are genuine and accurate to the best of my knowledge. I understand that submitting false or misleading information will result in statutory cancellation under Lakshmeshwar Town Municipal Council bylaws.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep("documents")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Documents</span>
              </button>

              <button
                type="button"
                disabled={!declared || submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
              >
                {submitting ? (
                  <span>Submitting to Council Desk...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: APPLICATION SUBMITTED & TRACKING ID                               */}
        {/* ========================================================================= */}
        {currentStep === "submitted" && submittedAppId && selectedService && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Official Municipal Submission Confirmed
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                Application Successfully Filed!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Your statutory request has been assigned to the{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedService.department}</span>.
                Verification engineers will process your file within the statutory SLA turnaround.
              </p>
            </div>

            {/* Tracking ID Display Card */}
            <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Your Municipal Tracking Reference ID
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#064E4A] dark:text-teal-300">
                  {submittedAppId}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(submittedAppId)}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 text-teal-800 dark:text-teal-300"
                  title="Copy Tracking ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-teal-800 dark:text-teal-400">
                Service: {selectedService.formNo} • Expected SLA: {selectedService.sla}
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href={`/track?id=${encodeURIComponent(submittedAppId)}`}
                className="px-5 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Track Live Application Status</span>
              </Link>

              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 hover:bg-teal-100 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>View in Citizen Dashboard</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Acknowledgment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setUploadedDocs({});
                  setCustomFieldValues({});
                  setSubmittedAppId(null);
                  setCurrentStep("select_service");
                }}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Apply for Another Service</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-xs text-gray-500">
          Loading municipal services application desk...
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}
