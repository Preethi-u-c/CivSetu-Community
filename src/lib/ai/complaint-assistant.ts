/**
 * CivSetu Community - AI Complaint Assistant Service
 * 
 * Provides an intelligent, pluggable assistant for civic grievance registration.
 * Allows citizens to describe problems in simple language, notes, or colloquial terms,
 * and receives:
 *   - Suggested complaint title (concise, formal, municipal-ready)
 *   - Improved complaint description (structured with Issue, Impact, and Action)
 *   - Suggested municipal category / department with match confidence
 *   - Missing information checklist / clarifying questions
 * 
 * Architecture:
 * - ComplaintAssistantProvider interface allows swapping providers without changing UI or backend routes.
 * - DeterministicMockAssistantProvider runs locally without external API keys (Gemini / OpenAI).
 * - Real LLM providers (e.g. Gemini 1.5/2.0) can be plugged in seamlessly via the provider interface.
 */

export interface ComplaintAssistantRequest {
  prompt: string;
  currentTitle?: string;
  currentDescription?: string;
  currentCategory?: string;
  ward?: string;
  address?: string;
  language?: string;
}

export interface ComplaintAssistantResponse {
  success: boolean;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCategory: string;
  suggestedCategoryConfidence: "high" | "medium" | "low";
  missingInformation: string[];
  provider: string;
  isMock: boolean;
  disclaimer: string;
}

export interface ComplaintAssistantProvider {
  name: string;
  isAvailable(): boolean;
  generateSuggestions(request: ComplaintAssistantRequest): Promise<ComplaintAssistantResponse>;
}

// Canonical Complaint Categories matching Lakshmeshwar TMC departments
export const CANONICAL_CATEGORIES = [
  "Water Supply & Metering",
  "Solid Waste Management & Sanitation",
  "Street Lighting & Electrical",
  "Roads, Footpaths & Drainage",
  "Public Health & Mosquito Control",
  "Property Tax & Municipal Revenue",
  "Parks, Trees & Civic Amenities",
  "Other Municipal Grievances",
] as const;

export type CanonicalCategory = typeof CANONICAL_CATEGORIES[number];

/**
 * Keyword dictionaries for deterministic classification and contextual enhancement
 */
interface CategoryRule {
  category: CanonicalCategory;
  department: string;
  keywords: string[];
  titleTemplates: string[];
  impactPhrases: string[];
  actionPhrases: string[];
  missingInfoChecks: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Water Supply & Metering",
    department: "Water Supply & Maintenance Wing, Lakshmeshwar TMC",
    keywords: [
      "water", "pipe", "pipeline", "leak", "leakage", "burst", "tap", "pressure",
      "drinking", "potable", "dirty water", "muddy", "contamination", "borewell",
      "meter", "supply", "neeru", "valve", "tank", "overheads", "dry tap",
    ],
    titleTemplates: [
      "Potable Water Pipeline Leakage & Distribution Disruption",
      "Low Water Pressure in Municipal Supply Line",
      "Contaminated / Turbid Drinking Water Supply Issue",
      "Damaged Municipal Water Valve Causing Supply Wastage",
    ],
    impactPhrases: [
      "Continuous water wastage and acute shortage for neighboring households",
      "Contaminated water poses serious health and gastrointestinal risks for local residents",
      "Water accumulation on public road causing mud puddles and vehicle skidding",
    ],
    actionPhrases: [
      "Immediate dispatch of water works technician to isolate valve and repair pipeline breach",
      "Water sample testing and flushing of the municipal distribution line",
      "Restoration of standard water supply schedule and pressure inspection",
    ],
    missingInfoChecks: [
      "Is the leakage affecting drinking water, borewell line, or main distribution pipe?",
      "Approximate time or days since water supply pressure/quality issue began?",
      "Exact landmark, street corner, or house number closest to the leakage?",
    ],
  },
  {
    category: "Solid Waste Management & Sanitation",
    department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
    keywords: [
      "garbage", "waste", "trash", "bin", "dump", "dumping", "kachra", "sweeping",
      "litter", "smell", "rotting", "debris", "compost", "plastic", "clean",
      "sanitation", "door-to-door", "solid waste", "swachh", "ghanta gadi",
    ],
    titleTemplates: [
      "Overflowing Community Garbage Bin Requiring Clearance",
      "Irregular Door-to-Door Municipal Waste Collection",
      "Unauthorized Waste Dumping on Public Site",
      "Accumulated Street Litter and Inadequate Dustbins",
    ],
    impactPhrases: [
      "Severe foul odor and stray animal scavenging creating hazardous sanitary conditions",
      "Unhygienic solid waste accumulation outside residential compounds and pedestrian pathways",
      "Potential vector-borne pathogen breeding due to rotting organic matter",
    ],
    actionPhrases: [
      "Urgent deployment of municipal tipper / compacting vehicle to clear accumulated waste",
      "Regularization of daily door-to-door waste collection frequency in this lane",
      "Sanitary lime/bleaching powder application and installation of warning signage",
    ],
    missingInfoChecks: [
      "How many days has the garbage remained uncollected?",
      "Is the waste overflowing onto the pedestrian pathway or near a school/food shop?",
      "Is there an designated community bin at the location or is it an unauthorized dump?",
    ],
  },
  {
    category: "Street Lighting & Electrical",
    department: "Electrical & Streetlighting Wing, Lakshmeshwar TMC",
    keywords: [
      "light", "street light", "streetlight", "lamp", "pole", "dark", "darkness",
      "bulb", "flicker", "flickering", "belaku", "wire", "cable", "hanging wire",
      "electrical", "blackout", "illumination", "led", "switch",
    ],
    titleTemplates: [
      "Non-Functional Streetlights Creating Nighttime Safety Hazard",
      "Flickering LED Streetlight Fixture Requiring Replacement",
      "Damaged Streetlight Pole / Hazardous Exposed Electrical Wiring",
      "Inadequate Streetlight Illumination Along Public Thoroughfare",
    ],
    impactPhrases: [
      "Complete darkness after dusk creating severe security concerns for women and senior citizens",
      "Reduced nocturnal visibility significantly increasing vehicular accident hazards",
      "Exposed wiring poses electrocution hazard, especially during rainy conditions",
    ],
    actionPhrases: [
      "Inspection and replacement of non-functional LED fixtures and automated control timer",
      "Insulation check and rewiring of vulnerable overhead connections",
      "Repair or upright alignment of damaged municipal streetlight pole",
    ],
    missingInfoChecks: [
      "How many streetlight poles along the stretch are currently non-functional?",
      "Are there any exposed wires or spark hazards within reach of pedestrians?",
      "Nearest identifiable landmark, shop, or pole number for the lineman to locate?",
    ],
  },
  {
    category: "Roads, Footpaths & Drainage",
    department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
    keywords: [
      "road", "pothole", "potholes", "drain", "drainage", "gutter", "culvert",
      "footpath", "slab", "waterlogging", "rasta", "stormwater", "asphalt",
      "tar", "crater", "flooding", "manhole", "cover", "sewage overflow",
    ],
    titleTemplates: [
      "Hazardous Potholes and Damaged Asphalt on Municipal Road",
      "Clogged Stormwater Drain Causing Road Waterlogging",
      "Broken Footpath Slabs and Missing Manhole Covers",
      "Severe Drainage Overflow Across Public Right-of-Way",
    ],
    impactPhrases: [
      "Deep craters causing regular vehicular damage and dangerous two-wheeler skids",
      "Drainage overflow emitting stench and blocking pedestrian transit to residences",
      "Stagnant road water eroding sub-base and causing localized traffic bottlenecks",
    ],
    actionPhrases: [
      "Asphalt cold-mix/WBM patching of hazardous potholes before monsoon escalation",
      "Desilting and manual clearance of the obstructed stormwater culvert",
      "Replacement of cracked pedestrian footpath slabs with reinforced concrete covers",
    ],
    missingInfoChecks: [
      "Is the road completely blocked or partially passable by two-wheelers and autos?",
      "Is the drain blockage overflowing into private properties or only the public road?",
      "Approximate dimensions or depth of the potholes causing the hazard?",
    ],
  },
  {
    category: "Public Health & Mosquito Control",
    department: "Health & Solid Waste Management Section, Lakshmeshwar TMC",
    keywords: [
      "mosquito", "mosquitoes", "dengue", "malaria", "fogging", "spray",
      "spraying", "stagnant", "stray dog", "dog bite", "dead animal", "carcass",
      "hygiene", "smoke", "larva", "fever", "insect", "rabies",
    ],
    titleTemplates: [
      "Intensive Mosquito Breeding in Stagnant Water - Fogging Requested",
      "Public Health Concern: Stray Canine Aggression and Safety Risk",
      "Immediate Carcass Removal and Sanitary Disinfection Needed",
      "Sanitary Spraying Required for Vector-Borne Disease Prevention",
    ],
    impactPhrases: [
      "Massive surge in mosquito infestation increasing risk of dengue and malaria for children",
      "Aggressive pack of stray dogs harassing school students and nocturnal pedestrians",
      "Severe biological contamination and unbearable stench affecting neighborhood",
    ],
    actionPhrases: [
      "Immediate thermal fogging and anti-larval chemical application in stagnant drains",
      "Deployment of TMC animal birth control and veterinary inspection team",
      "Safe sanitary removal and quicklime burial of animal carcass",
    ],
    missingInfoChecks: [
      "Are there reports of viral fevers/dengue cases currently reported in the locality?",
      "Is the stagnant water on a vacant plot, open municipal drain, or abandoned construction site?",
      "Has any preliminary notice or notification been submitted to the local health inspector?",
    ],
  },
  {
    category: "Property Tax & Municipal Revenue",
    department: "Revenue & Property Assessment Section, Lakshmeshwar TMC",
    keywords: [
      "tax", "property", "khata", "form 3", "sasya", "receipt", "assessment",
      "bill", "revenue", "challan", "dues", "online payment", "property id",
      "pid", "title transfer", "mutation", "survey",
    ],
    titleTemplates: [
      "Discrepancy in Municipal Property Tax Assessment Record",
      "Delay in Issuance of Form-3 / Sasya Khata Extract",
      "Reconciliation of Online Property Tax Payment Receipt",
      "Correction of Ownership Particulars in Municipal Register",
    ],
    impactPhrases: [
      "Citizen unable to complete formal property registration and utility transfer",
      "Discrepancy in recorded square footage causing incorrect tax penalty calculations",
      "Payment deducted from citizen bank account without generation of receipt",
    ],
    actionPhrases: [
      "Verification of assessment register against citizen's registered deed records",
      "Manual verification of bank payment reference and updating of revenue database",
      "Expedited processing and physical/digital issuance of the pending Khata extract",
    ],
    missingInfoChecks: [
      "What is your Assessment / Property ID (PID) number registered with TMC?",
      "What is the transaction reference / date of payment (if payment related)?",
      "Which tax year or period does the assessment record discrepancy concern?",
    ],
  },
  {
    category: "Parks, Trees & Civic Amenities",
    department: "Public Works & Civil Engineering Wing, Lakshmeshwar TMC",
    keywords: [
      "park", "tree", "branch", "branches", "garden", "bench", "toilet",
      "public toilet", "playground", "overhanging", "pruning", "lawn",
      "fence", "swing", "jogging track", "amenities",
    ],
    titleTemplates: [
      "Hazardous Overhanging Tree Branches Near Electrical Lines",
      "Maintenance and Running Water Required for Public Toilet Facility",
      "Damaged Playground Equipment & Cleanliness in Municipal Park",
      "Pruning of Dried Tree Limbs Threatening Public Safety",
    ],
    impactPhrases: [
      "Heavy tree limbs precarious during gusty winds, posing fatal danger to passersby",
      "Unsanitary public convenience facility forcing open defecation in market area",
      "Broken playground structures posing injury hazard to visiting children",
    ],
    actionPhrases: [
      "Immediate pruning of overgrown canopy by public works arboriculture crew",
      "Restoration of plumbing, water supply, and scheduled daily sanitation at public toilet",
      "Welding repair and safety inspection of damaged park recreational structures",
    ],
    missingInfoChecks: [
      "Are the tree branches touching live overhead electrical distribution lines?",
      "Is the public toilet facility completely locked or open but without running water?",
      "Which specific municipal park or civic garden is this equipment located in?",
    ],
  },
];

/**
 * Deterministic Mock AI Assistant Provider
 * Analyzes citizen prompt with keyword heuristics, classifies category,
 * constructs structured formal grievances, and generates missing information checks.
 */
export class DeterministicMockAssistantProvider implements ComplaintAssistantProvider {
  name = "CivSetu Local Civic Assistant (Preview - Rule-based AI Engine)";

  isAvailable(): boolean {
    return true;
  }

  async generateSuggestions(request: ComplaintAssistantRequest): Promise<ComplaintAssistantResponse> {
    const rawPrompt = (request.prompt || "").trim();
    const existingTitle = (request.currentTitle || "").trim();
    const existingDesc = (request.currentDescription || "").trim();
    const existingCat = (request.currentCategory || "").trim();
    const ward = (request.ward || "").trim();
    const address = (request.address || "").trim();

    // 1. Text normalization for matching
    const combinedText = `${rawPrompt} ${existingTitle} ${existingDesc} ${existingCat}`.toLowerCase();

    // 2. Score each category based on keyword density
    let bestMatch: CategoryRule | null = null;
    let highestScore = 0;

    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (combinedText.includes(kw)) {
          // Weight matches in the explicit citizen prompt higher
          score += rawPrompt.toLowerCase().includes(kw) ? 3 : 1;
        }
      }
      // If user had already selected this category, add affinity
      if (existingCat && existingCat.toLowerCase() === rule.category.toLowerCase()) {
        score += 2;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = rule;
      }
    }

    // Default fallback to Roads/Drainage or Other if no high-confidence keyword match
    const matchedRule = bestMatch || CATEGORY_RULES[3]; // Default to Roads or general
    const confidence: "high" | "medium" | "low" =
      highestScore >= 6 ? "high" : highestScore >= 3 ? "medium" : "low";

    const categoryResult = bestMatch ? matchedRule.category : (existingCat || "Other Municipal Grievances");

    // 3. Generate suggested Title
    let suggestedTitle = "";
    if (rawPrompt.length >= 10 && rawPrompt.length <= 60 && !rawPrompt.includes(".") && !rawPrompt.includes(",")) {
      // Citizen provided a short headline-like title
      const cleanPrompt = rawPrompt.charAt(0).toUpperCase() + rawPrompt.slice(1);
      suggestedTitle = `${cleanPrompt}${ward ? ` - ${ward}` : ""}`;
    } else {
      // Find template with most keyword overlap with the prompt
      let bestTemplate = matchedRule.titleTemplates[0];
      let maxKwHits = -1;
      for (const tpl of matchedRule.titleTemplates) {
        let hits = 0;
        const lowerTpl = tpl.toLowerCase();
        for (const kw of matchedRule.keywords) {
          if (lowerTpl.includes(kw) && rawPrompt.toLowerCase().includes(kw)) {
            hits++;
          }
        }
        if (hits > maxKwHits) {
          maxKwHits = hits;
          bestTemplate = tpl;
        }
      }
      const locationSuffix = address ? ` near ${address}` : ward ? ` in ${ward}` : " in Lakshmeshwar TMC";
      suggestedTitle = `${bestTemplate}${locationSuffix}`.slice(0, 150);
    }

    // 4. Generate structured formal Description
    const locationContext = address && ward
      ? `${address} (${ward})`
      : address || ward || "Lakshmeshwar Town Municipal Area";

    const citizenSummary = rawPrompt || existingDesc || "Civic infrastructure issue requiring prompt intervention.";
    const randomImpact = matchedRule.impactPhrases[Math.floor(Math.random() * matchedRule.impactPhrases.length)];
    const randomAction = matchedRule.actionPhrases[Math.floor(Math.random() * matchedRule.actionPhrases.length)];

    const suggestedDescription = 
`OFFICIAL GRIEVANCE TO LAKSHMESHWAR TOWN MUNICIPAL COUNCIL
Department: ${matchedRule.department}
Location: ${locationContext}

1. Issue Summary:
${citizenSummary}

2. Observed Public Impact:
${randomImpact}.

3. Requested Action:
${randomAction}. We request the concerned Ward Junior Engineer to inspect the site and initiate remedial measures as per Citizen Charter SLA timelines.`;

    // 5. Compile missing information questions
    const missingInfo: string[] = [];
    // Always include the rule's specific checklist
    for (const check of matchedRule.missingInfoChecks) {
      missingInfo.push(check);
    }

    // Add contextual prompts if location or ward is missing
    if (!address && !rawPrompt.toLowerCase().includes("near") && !rawPrompt.toLowerCase().includes("at")) {
      missingInfo.unshift("Exact physical landmark or street name where this issue is located.");
    }
    if (!ward) {
      missingInfo.push("Ward jurisdiction (Wards 01 to 23 of Lakshmeshwar TMC).");
    }

    return {
      success: true,
      suggestedTitle,
      suggestedDescription,
      suggestedCategory: categoryResult,
      suggestedCategoryConfidence: confidence,
      missingInformation: missingInfo.slice(0, 4),
      provider: "CivSetu Local Civic Assistant (Preview - Rule-based AI Engine)",
      isMock: true,
      disclaimer: "AI Assistance (Preview): Suggestions are generated locally to help structure your complaint. You must explicitly apply each suggestion to update your form.",
    };
  }
}

/**
 * Provider Singleton / Factory
 * Allows future swapping of external AI providers (e.g. Gemini 2.0 Flash) without
 * changing calling code.
 */
let activeProvider: ComplaintAssistantProvider = new DeterministicMockAssistantProvider();

export function setComplaintAssistantProvider(provider: ComplaintAssistantProvider): void {
  activeProvider = provider;
}

export function getComplaintAssistantProvider(): ComplaintAssistantProvider {
  return activeProvider;
}

export async function generateComplaintSuggestions(
  request: ComplaintAssistantRequest
): Promise<ComplaintAssistantResponse> {
  const provider = getComplaintAssistantProvider();
  return provider.generateSuggestions(request);
}
