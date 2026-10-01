import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = "http://localhost:3000";

async function runPhase4cTests() {
  console.log("================================================================");
  console.log(" CIVSETU PHASE 4C: AI COMPLAINT ASSISTANT REGRESSION SUITE");
  console.log(" Base URL: " + BASE_URL);
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const pagePath = path.join(__dirname, "..", "src", "app", "complaints", "new", "page.tsx");
    const pageCode = fs.readFileSync(pagePath, "utf-8");

    const servicePath = path.join(__dirname, "..", "src", "lib", "ai", "complaint-assistant.ts");
    assert(fs.existsSync(servicePath), "AI Assistant service file exists at src/lib/ai/complaint-assistant.ts");
    const serviceCode = fs.readFileSync(servicePath, "utf-8");

    const apiPath = path.join(__dirname, "..", "src", "app", "api", "complaints", "ai-assist", "route.ts");
    assert(fs.existsSync(apiPath), "API endpoint file exists at src/app/api/complaints/ai-assist/route.ts");
    const apiCode = fs.readFileSync(apiPath, "utf-8");

    // -------------------------------------------------------------------------
    // TEST 1: Architecture & Pluggable Provider Audit
    // -------------------------------------------------------------------------
    console.log("\n[Test 1] Auditing Pluggable AI Service Architecture & Mock Engine...");
    assert(serviceCode.includes("interface ComplaintAssistantRequest"), "Defines typed ComplaintAssistantRequest contract");
    assert(serviceCode.includes("interface ComplaintAssistantResponse"), "Defines typed ComplaintAssistantResponse contract");
    assert(serviceCode.includes("interface ComplaintAssistantProvider"), "Defines pluggable ComplaintAssistantProvider interface");
    assert(serviceCode.includes("class DeterministicMockAssistantProvider"), "Implements DeterministicMockAssistantProvider");
    assert(serviceCode.includes("setComplaintAssistantProvider"), "Supports runtime provider swapping for future real AI models");
    assert(serviceCode.includes("generateComplaintSuggestions"), "Exports unified suggestion generator function");
    assert(!serviceCode.includes("process.env.GEMINI_API_KEY"), "Initial implementation does not mandate Gemini API key");
    assert(!serviceCode.includes("process.env.OPENAI_API_KEY"), "Initial implementation does not mandate OpenAI API key");
    assert(serviceCode.includes("isMock: true"), "Flags mock/local preview status in response payload");
    assert(serviceCode.includes("disclaimer"), "Attaches civic preview disclaimer in response payload");

    // -------------------------------------------------------------------------
    // TEST 2: Single Expandable Assistant Panel UI Audit
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Auditing Single Expandable Assistant Panel in /complaints/new...");
    assert(pageCode.includes("AI Complaint Assistant"), "Contains official AI Complaint Assistant heading");
    assert(pageCode.includes("Preview"), "Clearly labels feature with 'Preview' badge");
    assert(pageCode.includes("ai-assistant-container"), "Provides designated assistant container element");
    assert(pageCode.includes("ai-assistant-panel"), "Provides designated assistant panel element");
    assert(pageCode.includes("ai-assistant-toggle"), "Provides expand/collapse toggle control");
    assert(pageCode.includes("aiAssistantOpen"), "Maintains expand/collapse state");
    assert(pageCode.includes("ChevronDown") && pageCode.includes("ChevronUp"), "Uses intuitive collapse/expand indicator chevrons");
    assert(pageCode.includes("aiPromptInput"), "Provides citizen rough notes prompt input state");
    assert(pageCode.includes("id=\"ai-prompt-input\""), "Features unique HTML ID on problem input textarea");

    // Verify absence of separate bottom modal
    assert(!pageCode.includes("AI ASSISTANT MODAL (Civic AI Assistant Integration Mock)"), "Does not duplicate assistant in separate modal; uses single panel");

    // -------------------------------------------------------------------------
    // TEST 3: Actions & Explicit Citizen Confirmation Audit
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Auditing Citizen Action Triggers & Non-Destructive Behavior...");
    assert(pageCode.includes("Improve My Complaint"), "Provides prominent 'Improve My Complaint' action");
    assert(pageCode.includes("Suggest Category"), "Provides dedicated 'Suggest Category' action");
    assert(pageCode.includes("Use Suggested Category"), "Provides explicit 'Use Suggested Category' action");
    assert(pageCode.includes("Use Suggested Title"), "Provides explicit 'Use Suggested Title' action");
    assert(pageCode.includes("Use Suggested Description"), "Provides explicit 'Use Suggested Description' action");
    assert(pageCode.includes("Apply All Suggestions"), "Provides optional 'Apply All Suggestions' bulk action");
    assert(pageCode.includes("handleApplySuggestedCategory"), "Has isolated handler for applying category only");
    assert(pageCode.includes("handleApplySuggestedTitle"), "Has isolated handler for applying title only");
    assert(pageCode.includes("handleApplySuggestedDescription"), "Has isolated handler for applying description only");

    // Verify non-destructive logic in handlers
    assert(
      pageCode.includes("handleApplySuggestedCategory") &&
      !pageCode.includes("handleApplySuggestedCategory = () => {\n    if (!aiSuggestions?.suggestedCategory) return;\n    setTitle"),
      "Applying suggested category does not overwrite existing title"
    );
    assert(
      pageCode.includes("handleApplySuggestedTitle") &&
      !pageCode.includes("handleApplySuggestedTitle = () => {\n    if (!aiSuggestions?.suggestedTitle) return;\n    setDescription"),
      "Applying suggested title does not overwrite existing description"
    );

    // -------------------------------------------------------------------------
    // TEST 4: Missing Information & Clarifying Questions Audit
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Auditing Missing Information & Clarifying Prompts...");
    assert(serviceCode.includes("missingInformation"), "Service returns missing information questions array");
    assert(pageCode.includes("aiSuggestions.missingInformation"), "Renders missing information section in UI");
    assert(pageCode.includes("Details that could improve your complaint:"), "Features clear heading for missing detail checklist");
    assert(serviceCode.includes("missingInfoChecks"), "Category rules define domain-specific missing information checklists");

    // -------------------------------------------------------------------------
    // TEST 5: Accessibility & State Prevention Audit
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Auditing Accessibility, Duplicate Click Safeguards & States...");
    assert(pageCode.includes("aria-label=\"AI Complaint Assistant\""), "Assistant container includes aria-label");
    assert(pageCode.includes("aria-expanded={aiAssistantOpen}"), "Toggle button includes dynamic aria-expanded attribute");
    assert(pageCode.includes("aria-controls=\"ai-assistant-panel\""), "Toggle button references controlled panel via aria-controls");
    assert(pageCode.includes("htmlFor=\"ai-prompt-input\""), "Prompt textarea has accessible <label htmlFor=\"ai-prompt-input\">");
    assert(pageCode.includes("role=\"status\""), "Includes role=\"status\" for live suggestion results and loading feedback");
    assert(pageCode.includes("role=\"alert\""), "Includes role=\"alert\" for error feedback");
    assert(pageCode.includes("aria-live=\"polite\""), "Uses aria-live=\"polite\" for screen-reader friendly status updates");
    assert(pageCode.includes("disabled={isAiProcessing || !aiPromptInput.trim()}"), "Disables action buttons during processing to prevent duplicate submissions");
    assert(pageCode.includes("focus:ring-2") && pageCode.includes("focus:ring-[#064E4A]"), "Implements high-contrast visible focus rings for keyboard navigation");

    // -------------------------------------------------------------------------
    // TEST 6: Preservation of Phase 4A & Phase 4B Functionality
    // -------------------------------------------------------------------------
    console.log("\n[Test 6] Auditing Preservation of Completed Phase 4A & 4B Features...");
    assert(pageCode.includes("COMPLAINT_CATEGORIES"), "Preserves 8 municipal complaint categories");
    assert(pageCode.includes("handleCaptureLocation"), "Preserves GPS coordinate capture");
    assert(pageCode.includes("MunicipalMapPickerModal"), "Preserves Municipal Map Picker integration");
    assert(pageCode.includes("handleMapLocationSelected"), "Preserves map coordinate and ward selection");
    assert(pageCode.includes("normalizeWardValue"), "Preserves ward value normalization");
    assert(pageCode.includes("handlePhotoSelect"), "Preserves photo upload handler");
    assert(pageCode.includes("photoModalOpen"), "Preserves photographic evidence lightbox");
    assert(pageCode.includes("handleSaveDraft"), "Preserves draft saving");
    assert(pageCode.includes("handleRestoreDraft"), "Preserves draft restoration");
    assert(pageCode.includes("currentStep === 2"), "Preserves Step 2 Review screen");

    // -------------------------------------------------------------------------
    // TEST 7: Live Backend AI Assistance Endpoint (/api/complaints/ai-assist)
    // -------------------------------------------------------------------------
    console.log("\n[Test 7] Verifying Live HTTP POST /api/complaints/ai-assist Endpoint...");

    // 7A: Empty payload rejection
    const emptyRes = await fetch(`${BASE_URL}/api/complaints/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "" }),
    });
    assert(emptyRes.status === 400, "Rejects empty prompt with HTTP 400 Bad Request");
    const emptyJson = await emptyRes.json();
    assert(emptyJson.success === false, "Empty prompt response indicates success: false");

    // 7B: Water Supply Suggestion Generation
    const waterPrompt = "Water pipe broken outside Someshwara temple, clean drinking water flowing on road for 2 days";
    const waterRes = await fetch(`${BASE_URL}/api/complaints/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: waterPrompt, ward: "Ward 03", address: "Near Someshwara Temple" }),
    });
    assert(waterRes.status === 200, "POST /api/complaints/ai-assist returns HTTP 200 OK for water issue");
    const waterJson = await waterRes.json();
    assert(waterJson.success === true, "Water suggestion reports success: true");
    assert(waterJson.data.suggestedCategory === "Water Supply & Metering", "Correctly suggests 'Water Supply & Metering' category");
    assert(waterJson.data.suggestedCategoryConfidence === "high", "Assigns high confidence match to water pipeline prompt");
    assert(typeof waterJson.data.suggestedTitle === "string" && waterJson.data.suggestedTitle.length > 5, "Generates formal suggested title");
    assert(waterJson.data.suggestedDescription.includes("OFFICIAL GRIEVANCE"), "Generates structured formal grievance description");
    assert(waterJson.data.suggestedDescription.includes("Water Works Section") || waterJson.data.suggestedDescription.includes("Water Supply"), "References appropriate municipal water wing in description");
    assert(Array.isArray(waterJson.data.missingInformation) && waterJson.data.missingInformation.length > 0, "Provides missing information questions array");
    assert(waterJson.data.isMock === true, "Flags isMock: true for transparency");
    assert(waterJson.data.disclaimer.includes("AI Assistance (Preview)"), "Includes preview disclaimer");

    // 7C: Streetlighting Suggestion Generation
    const lightPrompt = "Street lights are not working at night, completely dark street near main junction";
    const lightRes = await fetch(`${BASE_URL}/api/complaints/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: lightPrompt, ward: "Ward 04" }),
    });
    assert(lightRes.status === 200, "Returns HTTP 200 OK for streetlight issue");
    const lightJson = await lightRes.json();
    assert(lightJson.data.suggestedCategory === "Street Lighting & Electrical", "Correctly classifies 'Street Lighting & Electrical'");
    assert(lightJson.data.suggestedTitle.toLowerCase().includes("streetlight") || lightJson.data.suggestedTitle.toLowerCase().includes("light"), "Title mentions streetlights");

    // 7D: Solid Waste Suggestion Generation
    const garbagePrompt = "Big garbage dump kachra not cleaned for 4 days, dogs scattering waste everywhere";
    const garbageRes = await fetch(`${BASE_URL}/api/complaints/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: garbagePrompt, ward: "Ward 12" }),
    });
    assert(garbageRes.status === 200, "Returns HTTP 200 OK for solid waste issue");
    const garbageJson = await garbageRes.json();
    assert(garbageJson.data.suggestedCategory === "Solid Waste Management & Sanitation", "Correctly classifies 'Solid Waste Management & Sanitation'");

    // 7E: Roads & Drainage Suggestion Generation
    const roadPrompt = "Deep potholes on the main bus road, drainage gutter overflowing dirty water onto street";
    const roadRes = await fetch(`${BASE_URL}/api/complaints/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: roadPrompt, ward: "Ward 08" }),
    });
    assert(roadRes.status === 200, "Returns HTTP 200 OK for road and drainage issue");
    const roadJson = await roadRes.json();
    assert(roadJson.data.suggestedCategory === "Roads, Footpaths & Drainage", "Correctly classifies 'Roads, Footpaths & Drainage'");

    // 7F: Public Health / Mosquito Suggestion Generation
    const healthPrompt = "Too many mosquitoes in stagnant water ditch, high fever risk in colony, urgent fogging needed";
    const healthRes = await fetch(`${BASE_URL}/api/complaints/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: healthPrompt }),
    });
    assert(healthRes.status === 200, "Returns HTTP 200 OK for public health issue");
    const healthJson = await healthRes.json();
    assert(healthJson.data.suggestedCategory === "Public Health & Mosquito Control", "Correctly classifies 'Public Health & Mosquito Control'");

    // -------------------------------------------------------------------------
    // TEST 8: Live /complaints/new Route Inspection
    // -------------------------------------------------------------------------
    console.log("\n[Test 8] Inspecting Live /complaints/new HTTP Rendering...");
    const pageRes = await fetch(`${BASE_URL}/complaints/new`);
    assert(pageRes.status === 200, "GET /complaints/new returns HTTP 200 OK");
    const pageHtml = await pageRes.text();
    assert(pageHtml.includes("Lodge Citizen Grievance"), "Live route renders official grievance heading");
    assert(pageHtml.includes("Citizen Portal"), "Live route renders citizen portal breadcrumb");

    console.log("\n================================================================");
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed with unexpected error:", error);
    process.exit(1);
  }
}

runPhase4cTests();
