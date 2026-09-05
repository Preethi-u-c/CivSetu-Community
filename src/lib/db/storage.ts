import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  DatabaseSchema,
  GrievanceRecord,
  ServiceApplicationRecord,
  FeedbackRecord,
  NoticeRecord,
  VisitorStatsRecord,
} from "./types";
import {
  generateGrievanceId,
  generateApplicationId,
  generateFeedbackId,
  slugify,
} from "./idGenerator";
import { notices as initialNotices } from "@/data/notices";
import { siteConfig } from "@/data/siteConfig";

const STORAGE_DIR = path.join(process.cwd(), "data", "storage");
const DB_FILE = path.join(STORAGE_DIR, "civsetu-db.json");

// Simple promise-based write lock to ensure serialized atomic writes
let writeLock: Promise<void> = Promise.resolve();

function getInitialDatabase(): DatabaseSchema {
  const seededNotices: NoticeRecord[] = initialNotices.map((n) => ({
    id: n.id,
    title: n.title,
    titleKn: n.titleKn,
    slug: n.slug,
    category: n.category,
    categoryKn: n.categoryKn,
    relativeTime: n.relativeTime,
    relativeTimeKn: n.relativeTimeKn,
    date: n.date,
    content: n.content,
    contentKn: n.contentKn,
    isPublished: true,
    isPinned: n.id === "1",
    fileUrl: n.fileUrl,
    createdAt: new Date(`${n.date}T10:00:00Z`).toISOString(),
  }));

  const sampleGrievances: GrievanceRecord[] = [
    {
      id: "LMC-GRV-2026-1001",
      citizenName: "Basavaraj Kulkarni",
      mobileNumber: "9845123456",
      wardNumber: "3",
      category: "streetlights",
      subject: "Non-functional streetlight near Shanka Basadi junction",
      description:
        "The LED streetlight pole at the main entrance road of Ward 3 Shanka Basadi has not been working for the past 4 days, causing safety issues for residents at night.",
      priority: "NORMAL",
      status: "IN_PROGRESS",
      assignedDepartment: "Electrical / Public Works Cell",
      officialRemarks:
        "Field junior engineer inspected the line. Replacement LED driver unit is dispatched for repair tomorrow morning.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      timeline: [
        {
          status: "SUBMITTED",
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          note: "Grievance registered through CivSetu citizen portal.",
        },
        {
          status: "UNDER_REVIEW",
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          note: "Assigned to Electrical Cell Junior Engineer, Lakshmeshwar TMC.",
          updatedBy: "Chief Officer Desk",
        },
        {
          status: "IN_PROGRESS",
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          note: "Field inspection complete. Driver replacement under way.",
          updatedBy: "Electrical Cell",
        },
      ],
    },
    {
      id: "LMC-GRV-2026-1002",
      citizenName: "Sunita Angadi",
      mobileNumber: "9480112233",
      wardNumber: "7",
      category: "water",
      subject: "Low water pressure in municipal pipeline line 4",
      description:
        "Water supply pressure near KSRTC bus stand lane is extremely low during morning timings. Kindly clean the inlet valve.",
      priority: "HIGH",
      status: "RESOLVED",
      assignedDepartment: "Water Supply Cell",
      officialRemarks:
        "Pipeline air-lock resolved and booster pump filter cleared by water supply team. Full pressure restored.",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      timeline: [
        {
          status: "SUBMITTED",
          timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
          note: "Grievance registered via PIGRS Helpline 1902.",
        },
        {
          status: "IN_PROGRESS",
          timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
          note: "Plumbing maintenance team deployed to Ward 7.",
        },
        {
          status: "RESOLVED",
          timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
          note: "Air-lock cleared, regular pressure restored.",
          updatedBy: "Water Supply Inspector",
        },
      ],
    },
    {
      id: "LMC-GRV-2026-1003",
      citizenName: "Mahantesh Patil",
      mobileNumber: "9900223344",
      wardNumber: "2",
      category: "sanitation",
      subject: "Garbage collection vehicle delay on Market Road",
      description:
        "Daily commercial garbage tractor has not covered the market vegetable lane for two days. Request prompt clearing.",
      priority: "NORMAL",
      status: "SUBMITTED",
      assignedDepartment: "Health & Sanitation Dept",
      officialRemarks: undefined,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      timeline: [
        {
          status: "SUBMITTED",
          timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          note: "Grievance logged via CivSetu contact form.",
        },
      ],
    },
  ];

  const sampleApplications: ServiceApplicationRecord[] = [
    {
      id: "LMC-APP-2026-5001",
      serviceCode: "Form TMC-W1",
      serviceName: "Application for Piped Drinking Water Connection",
      applicantName: "Sharanappa Doddagoudar",
      mobileNumber: "9448123987",
      email: "sharan.d@gmail.com",
      wardNumber: "8",
      address: "House No. 142/B, Purasabe Colony, Lakshmeshwar",
      details: {
        connectionType: "Domestic / Residential 1/2 inch",
        propertyAssessmentNo: "LMC-ASSMT-2024-8841",
        plumberLicense: "Govt Certified TMC Plumber #12",
      },
      status: "INSPECTION_SCHEDULED",
      officialRemarks:
        "Documents verified. Assistant Engineer inspection scheduled for Monday at 11:00 AM.",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      timeline: [
        {
          status: "SUBMITTED",
          timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
          note: "Application submitted online with Property Tax receipt attachment.",
        },
        {
          status: "UNDER_VERIFICATION",
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          note: "Revenue cell verified ownership and khata extract.",
          updatedBy: "Revenue Cell Incharge",
        },
        {
          status: "INSPECTION_SCHEDULED",
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          note: "Site pipeline feasibility inspection scheduled.",
          updatedBy: "Water Supply Cell",
        },
      ],
    },
    {
      id: "LMC-APP-2026-5002",
      serviceCode: "Form TMC-TL2",
      serviceName: "Trade License Application & Renewal Form",
      applicantName: "Ramesh Agro Agencies",
      mobileNumber: "9880556677",
      email: "rameshagro@yahoo.com",
      wardNumber: "2",
      address: "Shop No. 12, APMC Market Yard, Lakshmeshwar",
      details: {
        tradeType: "Wholesale Grain & Fertilizer Retail",
        powerRequirement: "2 HP Single Phase",
        gstin: "29AABCR1234F1Z5",
      },
      status: "APPROVED",
      officialRemarks:
        "Sanitation NOC clear. Trade License issued under Karnataka Municipalities Act for 2026-27.",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      timeline: [
        {
          status: "SUBMITTED",
          timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
          note: "Renewal form submitted with fire & safety self-declaration.",
        },
        {
          status: "UNDER_VERIFICATION",
          timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
          note: "Sanitary inspector clearance verified.",
        },
        {
          status: "APPROVED",
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          note: "Trade License certificate approved and generated.",
          updatedBy: "Chief Officer Desk",
        },
      ],
    },
  ];

  const sampleFeedbacks: FeedbackRecord[] = [
    {
      id: "LMC-FB-2026-0001",
      citizenName: "Girish Hiremath",
      mobileNumber: "9740112244",
      wardNumber: "1",
      category: "water",
      suggestion:
        "Please consider building a small rainwater harvesting check bund near the Someshwara kalyani catchment to boost summer borewell water levels.",
      status: "FLAGGED_FOR_COUNCIL",
      officialNote: "Added to the upcoming council works committee discussion agenda.",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "LMC-FB-2026-0002",
      citizenName: "Pooja Hegde",
      mobileNumber: "9611334455",
      wardNumber: "12",
      category: "website",
      suggestion:
        "The bilingual font toggle and dark mode are very useful for elderly citizens reading notifications on mobile phones. Keep it up!",
      status: "REVIEWED",
      officialNote: "Acknowledged with thanks.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  return {
    grievances: sampleGrievances,
    applications: sampleApplications,
    feedbacks: sampleFeedbacks,
    notices: seededNotices,
    visitorStats: {
      totalVisitors: siteConfig.visitorStats.totalVisitors,
      uniqueVisitors: siteConfig.visitorStats.uniqueVisitors,
      registeredUsers: siteConfig.visitorStats.registeredUsers,
      lastRegisteredUser: siteConfig.visitorStats.lastRegisteredUser,
      publishedNotices: seededNotices.length,
      ipPlaceholder: siteConfig.visitorStats.ipPlaceholder,
      sinceDate: siteConfig.visitorStats.sinceDate,
      visitorIpHashes: [],
      lastVisitAt: new Date().toISOString(),
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Ensures storage folder exists and database file is initialized.
 */
function ensureInitialized(): DatabaseSchema {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    if (!raw.trim()) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }

    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error("Failed to read database file, initializing fallback:", err);
    return getInitialDatabase();
  }
}

/**
 * Atomically writes database to disk using a temp file and rename.
 */
async function writeDatabase(db: DatabaseSchema): Promise<void> {
  db.lastUpdated = new Date().toISOString();
  db.visitorStats.publishedNotices = db.notices.filter((n) => n.isPublished).length;

  const tempFile = path.join(
    STORAGE_DIR,
    `civsetu-db.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`
  );

  const serialized = JSON.stringify(db, null, 2);

  // Serialize writes via writeLock queue
  writeLock = writeLock
    .then(async () => {
      if (!fs.existsSync(STORAGE_DIR)) {
        await fs.promises.mkdir(STORAGE_DIR, { recursive: true });
      }
      await fs.promises.writeFile(tempFile, serialized, "utf-8");
      await fs.promises.rename(tempFile, DB_FILE);
    })
    .catch((err) => {
      console.error("Error writing database atomically:", err);
      // Clean up temp file if present
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (_) {}
      }
      throw err;
    });

  return writeLock;
}

/* =========================================================================
   PUBLIC DATABASE REPOSITORIES
   ========================================================================= */

export const db = {
  getRaw(): DatabaseSchema {
    return ensureInitialized();
  },

  async saveRaw(data: DatabaseSchema): Promise<void> {
    return writeDatabase(data);
  },

  // --- Grievance Repository ---
  grievances: {
    list(filter?: {
      status?: string;
      category?: string;
      ward?: string;
      search?: string;
    }): GrievanceRecord[] {
      const data = ensureInitialized();
      let list = data.grievances;

      if (filter?.status && filter.status !== "ALL") {
        list = list.filter((g) => g.status === filter.status);
      }
      if (filter?.category && filter.category !== "ALL") {
        list = list.filter((g) => g.category.toLowerCase() === filter.category?.toLowerCase());
      }
      if (filter?.ward && filter.ward !== "ALL") {
        list = list.filter((g) => g.wardNumber?.toString() === filter.ward?.toString());
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (g) =>
            g.id.toLowerCase().includes(q) ||
            g.citizenName.toLowerCase().includes(q) ||
            g.mobileNumber.includes(q) ||
            g.subject.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q)
        );
      }

      // Sort newest first
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    getById(idOrMobile: string): GrievanceRecord | undefined {
      const data = ensureInitialized();
      const trimmed = idOrMobile.trim();
      return data.grievances.find(
        (g) =>
          g.id.toLowerCase() === trimmed.toLowerCase() ||
          g.mobileNumber === trimmed
      );
    },

    async create(input: {
      citizenName: string;
      mobileNumber: string;
      wardNumber?: string;
      category: string;
      subject: string;
      description: string;
      priority?: "NORMAL" | "HIGH" | "URGENT";
    }): Promise<GrievanceRecord> {
      const data = ensureInitialized();
      const newId = generateGrievanceId(data.grievances.length);
      const now = new Date().toISOString();

      const newGrievance: GrievanceRecord = {
        id: newId,
        citizenName: input.citizenName.trim(),
        mobileNumber: input.mobileNumber.trim(),
        wardNumber: input.wardNumber?.trim(),
        category: input.category.trim(),
        subject: input.subject.trim(),
        description: input.description.trim(),
        priority: input.priority || "NORMAL",
        status: "SUBMITTED",
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            status: "SUBMITTED",
            timestamp: now,
            note: "Grievance registered in municipal tracking system.",
          },
        ],
      };

      data.grievances.unshift(newGrievance);
      await writeDatabase(data);
      return newGrievance;
    },

    async update(
      id: string,
      updates: {
        status?: GrievanceRecord["status"];
        priority?: GrievanceRecord["priority"];
        assignedDepartment?: string;
        officialRemarks?: string;
        updatedBy?: string;
        note?: string;
      }
    ): Promise<GrievanceRecord | null> {
      const data = ensureInitialized();
      const index = data.grievances.findIndex(
        (g) => g.id.toLowerCase() === id.trim().toLowerCase()
      );
      if (index === -1) return null;

      const record = data.grievances[index];
      const now = new Date().toISOString();

      if (updates.status && updates.status !== record.status) {
        record.status = updates.status;
        record.timeline.push({
          status: updates.status,
          timestamp: now,
          note: updates.note || `Status updated to ${updates.status} by council desk.`,
          updatedBy: updates.updatedBy || "Municipal Administrator",
        });
      }

      if (updates.priority) record.priority = updates.priority;
      if (updates.assignedDepartment !== undefined) {
        record.assignedDepartment = updates.assignedDepartment;
      }
      if (updates.officialRemarks !== undefined) {
        record.officialRemarks = updates.officialRemarks;
      }

      record.updatedAt = now;
      data.grievances[index] = record;
      await writeDatabase(data);
      return record;
    },
  },

  // --- Service Application Repository ---
  applications: {
    list(filter?: { serviceCode?: string; status?: string; search?: string }): ServiceApplicationRecord[] {
      const data = ensureInitialized();
      let list = data.applications;

      if (filter?.serviceCode && filter.serviceCode !== "ALL") {
        list = list.filter((a) => a.serviceCode === filter.serviceCode);
      }
      if (filter?.status && filter.status !== "ALL") {
        list = list.filter((a) => a.status === filter.status);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (a) =>
            a.id.toLowerCase().includes(q) ||
            a.applicantName.toLowerCase().includes(q) ||
            a.mobileNumber.includes(q) ||
            a.serviceName.toLowerCase().includes(q)
        );
      }

      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    getById(idOrMobile: string): ServiceApplicationRecord | undefined {
      const data = ensureInitialized();
      const trimmed = idOrMobile.trim();
      return data.applications.find(
        (a) =>
          a.id.toLowerCase() === trimmed.toLowerCase() ||
          a.mobileNumber === trimmed
      );
    },

    async create(input: {
      serviceCode: string;
      serviceName: string;
      applicantName: string;
      mobileNumber: string;
      email?: string;
      wardNumber?: string;
      address: string;
      details?: Record<string, string>;
    }): Promise<ServiceApplicationRecord> {
      const data = ensureInitialized();
      const newId = generateApplicationId(data.applications.length);
      const now = new Date().toISOString();

      const newApp: ServiceApplicationRecord = {
        id: newId,
        serviceCode: input.serviceCode,
        serviceName: input.serviceName,
        applicantName: input.applicantName.trim(),
        mobileNumber: input.mobileNumber.trim(),
        email: input.email?.trim(),
        wardNumber: input.wardNumber?.trim(),
        address: input.address.trim(),
        details: input.details || {},
        status: "SUBMITTED",
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            status: "SUBMITTED",
            timestamp: now,
            note: "Statutory application received online via CivSetu.",
          },
        ],
      };

      data.applications.unshift(newApp);
      await writeDatabase(data);
      return newApp;
    },

    async update(
      id: string,
      updates: {
        status?: ServiceApplicationRecord["status"];
        officialRemarks?: string;
        updatedBy?: string;
        note?: string;
      }
    ): Promise<ServiceApplicationRecord | null> {
      const data = ensureInitialized();
      const index = data.applications.findIndex(
        (a) => a.id.toLowerCase() === id.trim().toLowerCase()
      );
      if (index === -1) return null;

      const record = data.applications[index];
      const now = new Date().toISOString();

      if (updates.status && updates.status !== record.status) {
        record.status = updates.status;
        record.timeline.push({
          status: updates.status,
          timestamp: now,
          note: updates.note || `Application status changed to ${updates.status}.`,
          updatedBy: updates.updatedBy || "Town Municipal Council Desk",
        });
      }

      if (updates.officialRemarks !== undefined) {
        record.officialRemarks = updates.officialRemarks;
      }

      record.updatedAt = now;
      data.applications[index] = record;
      await writeDatabase(data);
      return record;
    },
  },

  // --- Feedback Repository ---
  feedback: {
    list(filter?: { status?: string; category?: string }): FeedbackRecord[] {
      const data = ensureInitialized();
      let list = data.feedbacks;

      if (filter?.status && filter.status !== "ALL") {
        list = list.filter((f) => f.status === filter.status);
      }
      if (filter?.category && filter.category !== "ALL") {
        list = list.filter((f) => f.category.toLowerCase() === filter.category?.toLowerCase());
      }

      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    async create(input: {
      citizenName: string;
      mobileNumber: string;
      wardNumber?: string;
      category: string;
      suggestion: string;
    }): Promise<FeedbackRecord> {
      const data = ensureInitialized();
      const newId = generateFeedbackId(data.feedbacks.length);
      const now = new Date().toISOString();

      const newFeedback: FeedbackRecord = {
        id: newId,
        citizenName: input.citizenName.trim(),
        mobileNumber: input.mobileNumber.trim(),
        wardNumber: input.wardNumber?.trim(),
        category: input.category.trim(),
        suggestion: input.suggestion.trim(),
        status: "PENDING",
        createdAt: now,
      };

      data.feedbacks.unshift(newFeedback);
      await writeDatabase(data);
      return newFeedback;
    },

    async updateStatus(
      id: string,
      status: FeedbackRecord["status"],
      officialNote?: string
    ): Promise<FeedbackRecord | null> {
      const data = ensureInitialized();
      const index = data.feedbacks.findIndex(
        (f) => f.id.toLowerCase() === id.trim().toLowerCase()
      );
      if (index === -1) return null;

      data.feedbacks[index].status = status;
      if (officialNote !== undefined) {
        data.feedbacks[index].officialNote = officialNote;
      }

      await writeDatabase(data);
      return data.feedbacks[index];
    },
  },

  // --- Notices Repository ---
  notices: {
    list(publishedOnly = false): NoticeRecord[] {
      const data = ensureInitialized();
      let list = data.notices;
      if (publishedOnly) {
        list = list.filter((n) => n.isPublished);
      }
      return list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    },

    getBySlug(slug: string): NoticeRecord | undefined {
      const data = ensureInitialized();
      const trimmed = slug.trim().toLowerCase();
      return data.notices.find((n) => n.slug.toLowerCase() === trimmed);
    },

    async create(input: {
      title: string;
      titleKn: string;
      category: string;
      categoryKn: string;
      content: string;
      contentKn: string;
      fileUrl?: string;
      isPinned?: boolean;
    }): Promise<NoticeRecord> {
      const data = ensureInitialized();
      const newId = (data.notices.length + 1).toString();
      const slug = slugify(input.title);
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];

      const newNotice: NoticeRecord = {
        id: newId,
        title: input.title.trim(),
        titleKn: input.titleKn.trim(),
        slug: slug,
        category: input.category.trim(),
        categoryKn: input.categoryKn.trim(),
        relativeTime: "Just now",
        relativeTimeKn: "ಈಗಷ್ಟೇ ಪ್ರಕಟಿಸಲಾಗಿದೆ",
        date: dateStr,
        content: input.content.trim(),
        contentKn: input.contentKn.trim(),
        isPublished: true,
        isPinned: !!input.isPinned,
        fileUrl: input.fileUrl?.trim(),
        createdAt: now.toISOString(),
      };

      data.notices.unshift(newNotice);
      data.visitorStats.publishedNotices = data.notices.filter((n) => n.isPublished).length;
      await writeDatabase(data);
      return newNotice;
    },

    async togglePublished(id: string): Promise<NoticeRecord | null> {
      const data = ensureInitialized();
      const index = data.notices.findIndex((n) => n.id === id);
      if (index === -1) return null;

      data.notices[index].isPublished = !data.notices[index].isPublished;
      data.visitorStats.publishedNotices = data.notices.filter((n) => n.isPublished).length;
      await writeDatabase(data);
      return data.notices[index];
    },

    async delete(id: string): Promise<boolean> {
      const data = ensureInitialized();
      const prevLen = data.notices.length;
      data.notices = data.notices.filter((n) => n.id !== id);
      if (data.notices.length !== prevLen) {
        data.visitorStats.publishedNotices = data.notices.filter((n) => n.isPublished).length;
        await writeDatabase(data);
        return true;
      }
      return false;
    },
  },

  // --- Statistics & Visitor Tracking ---
  stats: {
    getStats() {
      const data = ensureInitialized();
      const publishedCount = data.notices.filter((n) => n.isPublished).length;
      const totalGrievances = data.grievances.length;
      const pendingGrievances = data.grievances.filter(
        (g) => g.status === "SUBMITTED" || g.status === "UNDER_REVIEW" || g.status === "IN_PROGRESS"
      ).length;
      const resolvedGrievances = data.grievances.filter((g) => g.status === "RESOLVED").length;
      const totalApplications = data.applications.length;
      const pendingApplications = data.applications.filter(
        (a) => a.status === "SUBMITTED" || a.status === "UNDER_VERIFICATION" || a.status === "INSPECTION_SCHEDULED"
      ).length;
      const totalFeedback = data.feedbacks.length;

      return {
        visitorStats: {
          ...data.visitorStats,
          publishedNotices: publishedCount,
        },
        counts: {
          totalGrievances,
          pendingGrievances,
          resolvedGrievances,
          totalApplications,
          pendingApplications,
          totalFeedback,
          publishedNotices: publishedCount,
        },
      };
    },

    async recordVisit(clientIp: string): Promise<{ totalVisitors: number; uniqueVisitors: number }> {
      const data = ensureInitialized();
      const now = new Date().toISOString();

      // Create SHA-256 hash of IP for privacy compliance
      const ipHash = crypto.createHash("sha256").update(clientIp || "unknown").digest("hex").slice(0, 16);

      data.visitorStats.totalVisitors += 1;
      data.visitorStats.lastVisitAt = now;

      if (!data.visitorStats.visitorIpHashes.includes(ipHash)) {
        data.visitorStats.visitorIpHashes.push(ipHash);
        data.visitorStats.uniqueVisitors += 1;
      }

      await writeDatabase(data);
      return {
        totalVisitors: data.visitorStats.totalVisitors,
        uniqueVisitors: data.visitorStats.uniqueVisitors,
      };
    },
  },
};
