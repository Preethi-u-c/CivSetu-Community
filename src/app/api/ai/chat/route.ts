import { NextRequest, NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { complaintDb } from "@/lib/db/complaints";
import { authService } from "@/lib/services/authService";

export const dynamic = "force-dynamic";

// =============================================================================
// In-Memory Rate Limiter (25 requests / min per IP / session)
// =============================================================================
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(identifier: string, limit = 25, windowMs = 60000): boolean {
  const now = Date.now();
  const existing = rateLimits.get(identifier);

  if (!existing || now > existing.resetAt) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count++;
  return true;
}

// Clean up expired rate limit records periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimits.forEach((v, k) => {
      if (now > v.resetAt) rateLimits.delete(k);
    });
  }, 120000);
}

// =============================================================================
// Deterministic Municipal Knowledge Base (Zero-Downtime Safe Fallback Engine)
// =============================================================================
interface MunicipalIntent {
  reply: string;
  department: string;
  actions: { label: string; url: string }[];
  language: "en" | "kn";
}

function resolveMunicipalKnowledge(
  prompt: string,
  citizenWard?: string,
  complaintData?: { id: string; status: string; category: string; assignedAuthority: string; deadline: string } | null
): MunicipalIntent {
  const q = prompt.toLowerCase();

  // Detect Kannada language input
  const isKannada = /[\u0C80-\u0CFF]/.test(prompt) || q.includes("kannada") || q.includes("kannadadalli");

  // If a real complaint match is found in the database
  if (complaintData) {
    if (isKannada) {
      return {
        reply: `ನಿಮ್ಮ ದೂರು #${complaintData.id} ಪ್ರಸ್ತುತ "${complaintData.status}" ಸ್ಥಿತಿಯಲ್ಲಿದೆ. ಸಂಬಂಧಪಟ್ಟ ವಿಭಾಗ: ${complaintData.assignedAuthority}. ನಿಗದಿತ ಪರಿಹಾರ ಗಡುವು: ${new Date(complaintData.deadline).toLocaleDateString("kn-IN")}.`,
        department: complaintData.assignedAuthority,
        actions: [
          { label: "ದೂರಿನ ವಿವರ ನೋಡಿ", url: `/track?id=${encodeURIComponent(complaintData.id)}` },
          { label: "ನಾಗರಿಕ ಪೋರ್ಟಲ್", url: "/dashboard" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `Your grievance #${complaintData.id} (${complaintData.category}) is currently "${complaintData.status}". It is under active processing by "${complaintData.assignedAuthority}" with an SLA deadline of ${new Date(complaintData.deadline).toLocaleDateString("en-IN")}.`,
      department: complaintData.assignedAuthority,
      actions: [
        { label: `Track #${complaintData.id}`, url: `/track?id=${encodeURIComponent(complaintData.id)}` },
        { label: "Citizen Dashboard", url: "/dashboard" },
      ],
      language: "en",
    };
  }

  // 1. Water supply issues
  if (
    q.includes("water") ||
    q.includes("leak") ||
    q.includes("pipeline") ||
    q.includes("tap") ||
    q.includes("pressure") ||
    q.includes("ನೀರು") ||
    q.includes("ಕುಡಿಯುವ")
  ) {
    if (isKannada) {
      return {
        reply: `ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜನ್ನು ನೀರು ಸರಬರಾಜು ಮತ್ತು ನಿರ್ವಹಣಾ ವಿಭಾಗವು ನೋಡಿಕೊಳ್ಳುತ್ತದೆ. ನೀರಿನ ಪೈಪ್ ಸೋರಿಕೆ, ಕೊಳಕು ನೀರು ಅಥವಾ ಕಡಿಮೆ ಒತ್ತಡದ ಸಮಸ್ಯೆಗಳಿದ್ದರೆ ನೀವು ತಕ್ಷಣ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅಧಿಕೃತ ದೂರು ದಾಖಲಿಸಬಹುದು. ಹೊಸ ನಳ ಸಂಪರ್ಕಕ್ಕಾಗಿ ಅರ್ಜಿ ನಮೂನೆ TMC-W1 ಅನ್ನು ಸಲ್ಲಿಸಿ.`,
        department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
        actions: [
          { label: "ನೀರಿನ ದೂರು ದಾಖಲಿಸಿ", url: "/complaints/new?category=water" },
          { label: "ನಳ ಸಂಪರ್ಕ ಸೇವೆ", url: "/applications" },
          { label: "ಸ್ಥಿತಿ ಪರೀಕ್ಷಿಸಿ", url: "/track" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `Drinking water supply in Lakshmeshwar is managed by the Water Supply & Maintenance Wing. Piped potable water is distributed on an alternate-day schedule across wards (including ${citizenWard || "your locality"}).\n\n- To report pipeline leaks, muddy water, or low pressure, lodge an official grievance. Statutory SLA for pipeline breaches is 24 to 48 hours.\n- For new domestic or commercial water connections, submit Form TMC-W1 under Statutory Services.`,
      department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
      actions: [
        { label: "Report Water Problem", url: "/complaints/new?category=water" },
        { label: "Apply for Water Connection", url: "/applications" },
        { label: "Check Water Timetable", url: "/notices" },
      ],
      language: "en",
    };
  }

  // 2. Municipal Services Directory
  if (
    q.includes("where can i find") ||
    q.includes("find municipal services") ||
    q.includes("services directory") ||
    q.includes("services") ||
    q.includes("certificate") ||
    q.includes("ಸೇವೆಗಳು")
  ) {
    if (isKannada) {
      return {
        reply: `ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಎಲ್ಲಾ ಅಧಿಕೃತ ನಾಗರಿಕ ಸೇವೆಗಳನ್ನು ನಮ್ಮ "ನಾಗರಿಕ ಸೇವೆಗಳ ಡೈರೆಕ್ಟರಿ" (/services) ಪುಟದಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು. ಇಲ್ಲಿ ಕುಡಿಯುವ ನೀರು, ನೈರ್ಮಲ್ಯ, ಆಸ್ತಿ ತೆರಿಗೆ ಮತ್ತು ಖಾತಾ, ಜನನ/ಮರಣ ಪ್ರಮಾಣಪತ್ರಗಳು, ವಾಣಿಜ್ಯ ಪರವಾನಗಿ ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು ಲಭ್ಯವಿವೆ.`,
        department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
        actions: [
          { label: "ಸೇವೆಗಳ ಡೈರೆಕ್ಟರಿ ನೋಡಿ", url: "/services" },
          { label: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", url: "/applications" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `You can access all official civic offerings in the CivSetu Citizen Services Directory (/services). The directory provides comprehensive procedures, fee details, required forms, and expected SLAs across:\n\n1. Water & Sewerage Connections\n2. Property Tax & E-Swathu Khata Extracts\n3. Birth, Death & Marriage Certificates\n4. Trade Licenses & Hawkers Registration\n5. Solid Waste & Sanitation Clearance\n6. Grievance Redressal & Emergency Desks`,
      department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
      actions: [
        { label: "Open Services Directory", url: "/services" },
        { label: "Start Application", url: "/applications" },
        { label: "Emergency Contacts", url: "/contact" },
      ],
      language: "en",
    };
  }

  // 3. Document Requirements
  if (
    q.includes("document") ||
    q.includes("needed") ||
    q.includes("required") ||
    q.includes("eligibility") ||
    q.includes("ದಾಖಲೆಗಳು") ||
    q.includes("ಅರ್ಹತೆ")
  ) {
    if (isKannada) {
      return {
        reply: `ಪುರಸಭೆಯ ಪ್ರಮುಖ ಸೇವೆಗಳಿಗೆ ಅಗತ್ಯವಿರುವ ಮೂಲ ದಾಖಲೆಗಳು:\n1. ಖಾತಾ ಬದಲಾವಣೆ/ಪ್ರಮಾಣಪತ್ರ: ನೋಂದಾಯಿತ ಕ್ರಯಪತ್ರ (Sale Deed), ಇತ್ತೀಚಿನ ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿ ರಶೀದಿ (Form-3), ಮತ್ತು ಆಧಾರ್ ಕಾರ್ಡ್.\n2. ನಳ ಸಂಪರ್ಕ: ಆಸ್ತಿ ಮಾಲೀಕತ್ವದ ದಾಖಲೆ, ನಿರಾಕ್ಷೇಪಣಾ ಪತ್ರ (NOC), ಮತ್ತು ಆಧಾರ್ ಕಾರ್ಡ್.\n3. ವ್ಯಾಪಾರ ಪರವಾನಗಿ: ಬಾಡಿಗೆ ಒಪ್ಪಂದ/ಮಾಲೀಕತ್ವ ಪತ್ರ, ಅಗ್ನಿಶಾಮಕ ಸುರಕ್ಷತಾ ಪ್ರಮಾಣಪತ್ರ.\n\nನಿಖರವಾದ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿಗೆ ಸೇವಾ ವಿವರಗಳ ಪುಟವನ್ನು ಪರಿಶೀಲಿಸಿ.`,
        department: "Revenue & Municipal Administration Wing, Lakshmeshwar TMC",
        actions: [
          { label: "ಅರ್ಜಿ ನಮೂನೆಗಳು", url: "/applications" },
          { label: "ಸೇವಾ ನಿಯಮಾವಳಿ", url: "/services" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `Here are the mandatory statutory documents for primary Lakshmeshwar TMC civic services:\n\n• **E-Swathu Khata Extract / Mutation (Form TMC-KT3):**\n  - Registered Title Deed / Sale Deed\n  - Latest Property Tax Paid Receipt (Form-3)\n  - Aadhaar Card / ID Proof of Owner\n  - Encumbrance Certificate (EC - Form 15)\n\n• **New Drinking Water Connection (Form TMC-W1):**\n  - Property ownership proof or sanctioned building plan\n  - Recent tax paid receipt\n  - Identity proof (Aadhaar / Voter ID)\n\n• **Municipal Trade License (Form TMC-TL1):**\n  - Rental Agreement or Property Tax Receipt\n  - Fire & Safety NOC (where applicable)\n  - Aadhaar card & passport size photo`,
      department: "Revenue & Municipal Administration Wing, Lakshmeshwar TMC",
      actions: [
        { label: "Submit Service Application", url: "/applications" },
        { label: "Browse Services & SLAs", url: "/services" },
        { label: "Welfare Scheme Documents", url: "/schemes" },
      ],
      language: "en",
    };
  }

  // 4. Status of Complaint
  if (
    q.includes("status of my complaint") ||
    q.includes("track my complaint") ||
    q.includes("track complaint") ||
    q.includes("status") ||
    q.includes("ದೂರಿನ ಸ್ಥಿತಿ") ||
    q.includes("ಟ್ರ್ಯಾಕ್")
  ) {
    if (isKannada) {
      return {
        reply: `ನಿಮ್ಮ ದೂರಿನ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಎರಡು ಸುಲಭ ವಿಧಾನಗಳಿವೆ:\n1. ನಮ್ಮ ಅಧಿಕೃತ "ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್" ಪುಟದಲ್ಲಿ (/track) ನಿಮ್ಮ CMP-LMC-2026-XXXXX ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.\n2. ನಿಮ್ಮ "ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" (/dashboard) ಗೆ ಲಾಗಿನ್ ಆಗಿ ನಿಮ್ಮ ಎಲ್ಲಾ ಸಕ್ರಿಯ ಮತ್ತು ಇತ್ಯರ್ಥಗೊಂಡ ದೂರುಗಳ ಸಂಪೂರ್ಣ ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ.`,
        department: "Grievance Redressal Monitoring Cell, Lakshmeshwar TMC",
        actions: [
          { label: "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", url: "/track" },
          { label: "ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", url: "/dashboard" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `To check the real-time status of your complaint:\n\n1. Visit the **Tracking Desk** (/track) and enter your unique Grievance Reference ID (format: \`CMP-LMC-2026-XXXXX\`).\n2. Alternatively, open your **Citizen Dashboard** (/dashboard) to view live progress stages: Submitted → Formally Accepted → Department Assigned → Escalated → Resolved.\n\nYou can also paste your Complaint ID right here into Ask CivSetu to retrieve immediate live details!`,
      department: "Grievance Redressal Monitoring Cell, Lakshmeshwar TMC",
      actions: [
        { label: "Open Tracking Desk", url: "/track" },
        { label: "View Citizen Dashboard", url: "/dashboard" },
        { label: "Lodge New Complaint", url: "/complaints/new" },
      ],
      language: "en",
    };
  }

  // 5. Streetlights
  if (
    q.includes("streetlight") ||
    q.includes("street light") ||
    q.includes("light") ||
    q.includes("lamp") ||
    q.includes("dark") ||
    q.includes("darkness") ||
    q.includes("bulb") ||
    q.includes("ಬೀದಿ ದೀಪ") ||
    q.includes("ದೀಪ")
  ) {
    if (isKannada) {
      return {
        reply: `ಲಕ್ಷ್ಮೇಶ್ವರ ಪಟ್ಟಣದ ಎಲ್ಲಾ ಬೀದಿ ದೀಪಗಳು ಮತ್ತು ವಿದ್ಯುತ್ ಕಂಬಗಳ ನಿರ್ವಹಣೆಯನ್ನು "ವಿದ್ಯುತ್ ಮತ್ತು ಬೀದಿ ದೀಪ ವಿಭಾಗ" (Electrical & Streetlighting Wing) ನಿರ್ವಹಿಸುತ್ತದೆ. ಬೀದಿ ದೀಪಗಳು ಉರಿಯದಿದ್ದರೆ ಅಥವಾ ವಿದ್ಯುತ್ ವೈರ್‌ಗಳಲ್ಲಿ ತೊಂದರೆ ಇದ್ದರೆ, ದೂರು ದಾಖಲಿಸಿದ 24 ರಿಂದ 48 ಗಂಟೆಗಳ ಒಳಗೆ ದುರಸ್ತಿ ಮಾಡುವುದು ಕಡ್ಡಾಯ ನಿಯಮವಾಗಿದೆ.`,
        department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
        actions: [
          { label: "ಬೀದಿ ದೀಪದ ದೂರು ದಾಖಲಿಸಿ", url: "/complaints/new?category=streetlights" },
          { label: "ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", url: "/track" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `**Department Responsible:** Streetlights in Lakshmeshwar are exclusively maintained by the **Electrical & Streetlighting Wing, Lakshmeshwar TMC**.\n\n• **Statutory SLA:** Defective LED fixtures, burnt bulbs, or localized switch issues must be repaired within **24 to 48 hours** as mandated by the Karnataka Citizen Charter.\n• **Hazardous Wiring / Fallen Poles:** Handled under Priority High / Urgent with same-day emergency dispatch.\n\nTo report a non-functional streetlight, lodge a grievance with your pole number or nearest landmark.`,
      department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
      actions: [
        { label: "Report Defective Streetlight", url: "/complaints/new?category=streetlights" },
        { label: "Track Escalation Status", url: "/track" },
      ],
      language: "en",
    };
  }

  // 6. Solid Waste & Sanitation
  if (
    q.includes("garbage") ||
    q.includes("waste") ||
    q.includes("trash") ||
    q.includes("dump") ||
    q.includes("kachra") ||
    q.includes("drain") ||
    q.includes("gutter") ||
    q.includes("ಕಸ") ||
    q.includes("ಸ್ವಚ್ಛತೆ")
  ) {
    if (isKannada) {
      return {
        reply: `ಘನತ್ಯಾಜ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯವನ್ನು ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಆರೋಗ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ ಶಾಖೆಯು ನಿರ್ವಹಿಸುತ್ತದೆ. ಪಟ್ಟಣದ 23 ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 6:30 ರಿಂದ 10:30 ರವರೆಗೆ ಮನೆ-ಮನೆಗೆ ಕಸ ಸಂಗ್ರಹಣೆ ವಾಹನಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ. ಕಸ ಸಂಗ್ರಹಣೆ ವಿಳಂಬವಾದರೆ ಅಥವಾ ಚರಂಡಿ ಕಟ್ಟಿಕೊಂಡಿದ್ದರೆ ತಕ್ಷಣ ದೂರು ದಾಖಲಿಸಿ.`,
        department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
        actions: [
          { label: "ಕಸ/ನೈರ್ಮಲ್ಯ ದೂರು ದಾಖಲಿಸಿ", url: "/complaints/new?category=waste" },
          { label: "ಸ್ವಚ್ಛತಾ ಮಾರ್ಗಸೂಚಿ", url: "/services" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `Solid Waste Management and drainage sanitation are overseen by the **Health & Solid Waste Management Section, Lakshmeshwar TMC**.\n\n• **Door-to-Door Collection:** Operates daily from 6:30 AM to 10:30 AM across all 23 municipal wards.\n• **Segregation:** Mandatory separation of wet (organic) and dry (recyclable) waste.\n• **Drainage / Overflow:** Overflowing open drains and community dump sites receive prompt vacuum tipper deployment within 24 hours.`,
      department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
      actions: [
        { label: "Report Sanitation / Garbage", url: "/complaints/new?category=waste" },
        { label: "Report Clogged Drainage", url: "/complaints/new?category=drainage" },
      ],
      language: "en",
    };
  }

  // 7. Government Schemes
  if (
    q.includes("scheme") ||
    q.includes("pension") ||
    q.includes("subsidy") ||
    q.includes("pmay") ||
    q.includes("gruha") ||
    q.includes("ಯೋಜನೆ")
  ) {
    if (isKannada) {
      return {
        reply: `ಲಕ್ಷ್ಮೇಶ್ವರ ನಾಗರಿಕರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು:\n- ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ (PMAY-U): ನಗರ ಬಡವರಿಗೆ ವಸತಿ ಸಹಾಯಧನ\n- ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ: ಕುಟುಂಬದ ಮಹಿಳಾ ಮುಖ್ಯಸ್ಥರಿಗೆ ಮಾಸಿಕ ₹2,000 ಧನಸಹಾಯ\n- ಪಿಎಂ-ಸ್ವನಿಧಿ: ಬೀದಿಬದಿ ವ್ಯಾಪಾರಿಗಳಿಗೆ ವಿಶೇಷ ಕಿರು ಸಾಲ ಯೋಜನೆ\n- ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ: ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಮಾಸಿಕ ಪಿಂಚಣಿ\n\nಸಂಪೂರ್ಣ ಮಾಹಿತಿ ಮತ್ತು ಅಧಿಕೃತ ಲಿಂಕ್‌ಗಳಿಗಾಗಿ ಯೋಜನೆಗಳ ಪೋರ್ಟಲ್ (/schemes) ವೀಕ್ಷಿಸಿ.`,
        department: "Social Welfare & Poverty Alleviation Cell, Lakshmeshwar TMC",
        actions: [
          { label: "ಯೋಜನೆಗಳ ವಿವರ ನೋಡಿ", url: "/schemes" },
          { label: "ಸೇವೆಗಳ ಡೈರೆಕ್ಟರಿ", url: "/services" },
        ],
        language: "kn",
      };
    }

    return {
      reply: `Eligible citizens of Lakshmeshwar can access central and Karnataka state welfare schemes through our **Government Schemes Portal** (/schemes):\n\n1. **PMAY-U (Urban Housing):** Subsidy up to ₹2.67 Lakhs for pucca house construction.\n2. **Gruha Lakshmi:** ₹2,000 monthly financial assistance for female heads of household.\n3. **PM-SVANidhi:** Working capital credit loans up to ₹50,000 for registered street vendors.\n4. **Sandhya Suraksha & Disability Pensions:** Monthly DBT financial support for seniors.`,
      department: "Social Welfare & Poverty Alleviation Cell, Lakshmeshwar TMC",
      actions: [
        { label: "Browse Government Schemes", url: "/schemes" },
        { label: "Municipal Services", url: "/services" },
      ],
      language: "en",
    };
  }

  // 8. General / Fallback
  if (isKannada) {
    return {
      reply: `ನಮಸ್ಕಾರ! ನಾನು ಸಿವ್‌ಸೇತು - ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಅಧಿಕೃತ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ನಾಗರಿಕ ಸಹಾಯಕ. ಕುಡಿಯುವ ನೀರು, ಬೀದಿ ದೀಪಗಳು, ಕಸ ನಿರ್ವಹಣೆ, ಆಸ್ತಿ ತೆರಿಗೆ (Form-3), ಖಾತಾ ಪ್ರಮಾಣಪತ್ರ, ನಾಗರಿಕ ದೂರುಗಳು ಅಥವಾ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಕುರಿತು ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಬಹುದು.`,
      department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
      actions: [
        { label: "ಹೊಸ ದೂರು ದಾಖಲಿಸಿ", url: "/complaints/new" },
        { label: "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", url: "/track" },
        { label: "ಸೇವೆಗಳ ವಿವರ", url: "/services" },
      ],
      language: "kn",
    };
  }

  return {
    reply: `Namaskara! I am CivSetu, your automated Lakshmeshwar Town Municipal Council (TMC) AI civic assistant.\n\nI can assist you with:\n• Lodging and tracking civic grievances (water, roads, streetlights, sanitation)\n• Applying for municipal certificates and Khata extracts (Form-3)\n• Checking municipal garbage collection and drinking water schedules\n• Browsing eligibility for welfare schemes (PMAY-U, Gruha Lakshmi, PM-SVANidhi)\n\nPlease ask your question in English or Kannada (ಕನ್ನಡ).`,
    department: "Citizen Facilitation Centre (CFC), Lakshmeshwar TMC",
    actions: [
      { label: "Lodge a Grievance", url: "/complaints/new" },
      { label: "Track Existing Case", url: "/track" },
      { label: "Browse Municipal Services", url: "/services" },
    ],
    language: "en",
  };
}

// =============================================================================
// Cloud Gemini AI Invocation Function
// =============================================================================
async function callCloudGemini(prompt: string, contextInfo: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are CivSetu, the official AI Civic Assistant for Lakshmeshwar Town Municipal Council (TMC), Gadag District, Karnataka, India.
Your mission is to provide accurate, respectful, and authoritative civic assistance to citizens.
Context on Lakshmeshwar TMC:
- 23 Municipal Wards
- Departments: Water Supply & Maintenance Wing, Health & Solid Waste Management Section, Electrical & Streetlighting Wing, Roads & Drainage Division, Revenue & Property Tax Cell.
- Statutory Grievance SLA: Low (7 days), Medium (3 days), High (24 hours), Urgent (12 hours).
- 4-Tier Escalation: Local TMC Authority -> Lakshmeshwar Taluk Panchayat -> Gadag Zilla Panchayat -> District Administration (Deputy Commissioner Gadag).
- Direct Links available on CivSetu: /complaints/new (Report issue), /track (Track complaint), /services (Services directory), /applications (Statutory permits), /schemes (Welfare schemes), /notices (Gazette circulars).
Guidelines:
1. If the user asks in Kannada, respond in fluent, respectful, grammatical Kannada (ಕನ್ನಡ). Otherwise in English.
2. Provide concise, clear, and actionable advice with statutory timelines.
3. Always distinguish official municipal processes from general guidance.
4. Mention the responsible department when answering.
Context Info: ${contextInfo}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Gemini Cloud API returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
  } catch (err) {
    console.warn("Gemini Cloud API call failed or timed out. Falling back to local municipal engine.", err);
    return null;
  }
}

// =============================================================================
// POST /api/ai/chat
// =============================================================================
export async function POST(req: NextRequest) {
  try {
    // 1. IP & Rate Limiting Security
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous-client";
    const allowed = checkRateLimit(clientIp, 25, 60000);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit reached. Please wait a moment before sending another query to Ask CivSetu.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt || prompt.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid question or query." },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Query exceeds maximum permitted length of 1,000 characters." },
        { status: 400 }
      );
    }

    // 2. Extract Session & Ward Context (if citizen logged in)
    const citizen = await authService.getSessionCitizen().catch(() => null);
    const citizenWard = citizen?.wardNumber || body.citizenWard || undefined;

    // 3. Check for Complaint ID Mention in Prompt
    let complaintData: { id: string; status: string; category: string; assignedAuthority: string; deadline: string } | null = null;
    const complaintMatch = prompt.match(/CMP-LMC-[A-Z0-9-]+/i) || prompt.match(/CMP-[A-Z0-9-]+/i);
    if (complaintMatch && isPostgresConfigured()) {
      try {
        const found = await complaintDb.getById(complaintMatch[0].toUpperCase());
        if (found) {
          complaintData = {
            id: found.id,
            status: found.status,
            category: found.category,
            assignedAuthority: found.assignedAuthority,
            deadline: found.deadline,
          };
        }
      } catch (err) {
        console.error("Error looking up complaint for AI context:", err);
      }
    }

    // 4. Resolve Knowledge via Local Engine (Provides baseline answers, actions, and fallback)
    const localMatch = resolveMunicipalKnowledge(prompt, citizenWard, complaintData);

    // 5. Attempt Cloud Gemini AI (if API key available)
    const contextInfo = `Citizen Ward: ${citizenWard || "Unspecified"}, Found Complaint Data: ${JSON.stringify(complaintData || "None")}`;
    const cloudResponse = await callCloudGemini(prompt, contextInfo);

    const isRealAI = Boolean(cloudResponse);
    const finalReply = cloudResponse || localMatch.reply;
    const providerName = isRealAI
      ? "Google Gemini 1.5 Flash (Cloud Municipal AI)"
      : "CivSetu Local Municipal Knowledge Engine (Safe Fallback)";

    return NextResponse.json({
      success: true,
      reply: finalReply,
      officialDepartment: localMatch.department,
      suggestedActions: localMatch.actions,
      disclaimer: "Civic AI Assistance: Guidance is generated to facilitate citizen access to Lakshmeshwar TMC services. Official municipal decisions are governed by the Karnataka Municipalities Act and physical field verification.",
      provider: providerName,
      isRealAI,
      language: localMatch.language,
    });
  } catch (error) {
    console.error("Error in POST /api/ai/chat:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
