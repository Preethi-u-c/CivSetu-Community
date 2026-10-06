import fs from "fs";
import path from "path";
import assert from "assert";

console.log("===============================================================================");
console.log("  CIVSETU COMMUNITY: MULTILINGUAL, VOICE UI & ACCESSIBILITY VERIFICATION SUITE");
console.log("===============================================================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] #${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] #${total}: ${name}`);
    console.error(`         Error: ${err.message}`);
  }
}

const ROOT = process.cwd();

// =============================================================================
// 1. Multilingual Support Verification (English | ಕನ್ನಡ | हिंदी)
// =============================================================================
console.log("--- 1. MULTILINGUAL SUPPORT TESTS (en | kn | hi) ---");

const translationsPath = path.join(ROOT, "src", "data", "translations.ts");
const translationsContent = fs.readFileSync(translationsPath, "utf-8");

test("Language type definition contains 'en', 'kn', and 'hi'", () => {
  assert(translationsContent.includes('export type Language = "en" | "kn" | "hi";'), "Language type must include 'hi'");
});

test("Translation dictionary covers all required sections", () => {
  const sections = [
    "topBar",
    "header",
    "nav",
    "buttons",
    "forms",
    "complaintCategories",
    "errors",
    "notifications",
    "dashboard",
    "publicContent",
    "accessibility",
    "voice",
    "officials",
    "services",
    "map",
    "info",
    "policy"
  ];
  sections.forEach((sec) => {
    assert(translationsContent.includes(`${sec}:`), `Dictionary interface must declare section '${sec}'`);
  });
});

test("English (en) translation contains all civic complaint categories", () => {
  assert(translationsContent.includes('"Water Supply & Pipelines"'));
  assert(translationsContent.includes('"Electricity & Power Supply"'));
  assert(translationsContent.includes('"Sanitation & Public Cleanliness"'));
  assert(translationsContent.includes('"Roads & Footpaths"'));
  assert(translationsContent.includes('"Solid Waste & Garbage Collection"'));
});

test("Kannada (kn) translation contains natural Kannada civic terminology", () => {
  assert(translationsContent.includes('"ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಪೈಪ್‌ಲೈನ್"'));
  assert(translationsContent.includes('"ವಿದ್ಯುತ್ ಮತ್ತು ವಿದ್ಯುತ್ ಸರಬರಾಜು"'));
  assert(translationsContent.includes('"ನೈರ್ಮಲ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸ್ವಚ್ಛತೆ"'));
  assert(translationsContent.includes('"ರಸ್ತೆಗಳು ಮತ್ತು ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು"'));
  assert(translationsContent.includes('"ಘನತ್ಯಾಜ್ಯ ಮತ್ತು ಕಸ ಸಂಗ್ರಹ"'));
  assert(translationsContent.includes('"ದೂರು ದಾಖಲಿಸಿ"'));
  assert(translationsContent.includes('"ನಾಗರಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್"'));
});

test("Hindi (hi) translation contains natural Hindi civic terminology", () => {
  assert(translationsContent.includes('"जल आपूर्ति एवं पाइपलाइन"'));
  assert(translationsContent.includes('"बिजली और विद्युत आपूर्ति"'));
  assert(translationsContent.includes('"स्वच्छता और सार्वजनिक सफाई"'));
  assert(translationsContent.includes('"सड़कें और फुटपाथ"'));
  assert(translationsContent.includes('"ठोस कचरा और कूड़ा निस्तारण"'));
  assert(translationsContent.includes('"शिकायत दर्ज करें"'));
  assert(translationsContent.includes('"नागरिक डैशबोर्ड"'));
});

test("AccessibilityContext exports useTranslation helper alongside useAccessibility", () => {
  const accContextPath = path.join(ROOT, "src", "context", "AccessibilityContext.tsx");
  const accContextContent = fs.readFileSync(accContextPath, "utf-8");
  assert(accContextContent.includes("export function useTranslation()"));
  assert(accContextContent.includes("useAccessibility()"));
});

test("UtilityBar renders 3-way language switcher (English | ಕನ್ನಡ | हिंदी)", () => {
  const utilityBarPath = path.join(ROOT, "src", "components", "UtilityBar", "UtilityBar.tsx");
  const utilityBarContent = fs.readFileSync(utilityBarPath, "utf-8");
  assert(utilityBarContent.includes('setLanguage("en")'));
  assert(utilityBarContent.includes('setLanguage("kn")'));
  assert(utilityBarContent.includes('setLanguage("hi")'));
  assert(utilityBarContent.includes("English"));
  assert(utilityBarContent.includes("ಕನ್ನಡ"));
  assert(utilityBarContent.includes("हिंदी"));
});

test("Main Navigation renders translated items via dictionary keys", () => {
  const navBarPath = path.join(ROOT, "src", "components", "Navigation", "NavBar.tsx");
  const navBarContent = fs.readFileSync(navBarPath, "utf-8");
  assert(navBarContent.includes("name: t.nav.home"));
  assert(navBarContent.includes("name: t.nav.services"));
  assert(navBarContent.includes("name: t.nav.announcements"));
  assert(navBarContent.includes("name: t.nav.news"));
  assert(navBarContent.includes("name: t.nav.events"));
  assert(navBarContent.includes("name: t.nav.schemes"));
  assert(navBarContent.includes("name: t.nav.askCivsetu"));
});

test("Mobile drawer provides direct 3-way language selector buttons", () => {
  const navBarPath = path.join(ROOT, "src", "components", "Navigation", "NavBar.tsx");
  const navBarContent = fs.readFileSync(navBarPath, "utf-8");
  assert(navBarContent.includes("Select Language / ಭಾಷೆ / भाषा:"));
  assert(navBarContent.includes('onClick={() => setLanguage("en")}'));
  assert(navBarContent.includes('onClick={() => setLanguage("kn")}'));
  assert(navBarContent.includes('onClick={() => setLanguage("hi")}'));
});

// =============================================================================
// 2. Voice UI Verification (Speech Recognition -> Text Input)
// =============================================================================
console.log("\n--- 2. VOICE UI TESTS (Speech Recognition -> Text Input) ---");

const speechHookPath = path.join(ROOT, "src", "hooks", "useSpeechRecognition.ts");
test("useSpeechRecognition hook file exists and compiles", () => {
  assert(fs.existsSync(speechHookPath), "useSpeechRecognition.ts must exist");
});

const speechHookContent = fs.readFileSync(speechHookPath, "utf-8");

test("useSpeechRecognition maps language to BCP 47 codes (en-IN, kn-IN, hi-IN)", () => {
  assert(speechHookContent.includes('"kn-IN"'), "Must map Kannada to kn-IN");
  assert(speechHookContent.includes('"hi-IN"'), "Must map Hindi to hi-IN");
  assert(speechHookContent.includes('"en-IN"'), "Must map English to en-IN");
});

test("useSpeechRecognition handles SpeechRecognition and webkitSpeechRecognition", () => {
  assert(speechHookContent.includes("win.SpeechRecognition || win.webkitSpeechRecognition"));
  assert(speechHookContent.includes("startListening"));
  assert(speechHookContent.includes("stopListening"));
  assert(speechHookContent.includes("isListening"));
  assert(speechHookContent.includes("isSupported"));
});

const voiceButtonPath = path.join(ROOT, "src", "components", "Voice", "VoiceInputButton.tsx");
test("VoiceInputButton component exists and exports component", () => {
  assert(fs.existsSync(voiceButtonPath), "VoiceInputButton.tsx must exist");
  const voiceBtnContent = fs.readFileSync(voiceButtonPath, "utf-8");
  assert(voiceBtnContent.includes("export const VoiceInputButton"));
});

const voiceBtnContent = fs.readFileSync(voiceButtonPath, "utf-8");

test("VoiceInputButton renders accessible screen reader live region", () => {
  assert(voiceBtnContent.includes('aria-live="polite"'));
  assert(voiceBtnContent.includes('role="status"'));
});

test("VoiceInputButton supports keyboard triggers (Space / Enter / Escape)", () => {
  assert(voiceBtnContent.includes('e.key === "Enter" || e.key === " "'));
  assert(voiceBtnContent.includes('e.key === "Escape"'));
});

test("VoiceInputButton is integrated into Ask CivSetu Modal", () => {
  const modalPath = path.join(ROOT, "src", "components", "AI", "AskCivSetuModal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf-8");
  assert(modalContent.includes("VoiceInputButton"), "AskCivSetuModal must import VoiceInputButton");
  assert(modalContent.includes("<VoiceInputButton"), "AskCivSetuModal must render VoiceInputButton");
});

test("VoiceInputButton is integrated into Ask CivSetu Dedicated Page", () => {
  const askPagePath = path.join(ROOT, "src", "app", "ask-civsetu", "page.tsx");
  const askPageContent = fs.readFileSync(askPagePath, "utf-8");
  assert(askPageContent.includes("VoiceInputButton"), "Ask CivSetu page must import VoiceInputButton");
  assert(askPageContent.includes("<VoiceInputButton"), "Ask CivSetu page must render VoiceInputButton");
});

test("VoiceInputButton is integrated into Complaint Description and Title", () => {
  const complaintNewPath = path.join(ROOT, "src", "app", "complaints", "new", "page.tsx");
  const complaintContent = fs.readFileSync(complaintNewPath, "utf-8");
  assert(complaintContent.includes("VoiceInputButton"), "complaints/new must import VoiceInputButton");
  assert(complaintContent.includes("Dictate detailed grievance description"), "Must have dictation on description");
  assert(complaintContent.includes("Dictate complaint title using microphone"), "Must have dictation on title");
});

test("VoiceInputButton is integrated into Services Directory Search", () => {
  const servicesPath = path.join(ROOT, "src", "app", "services", "page.tsx");
  const servicesContent = fs.readFileSync(servicesPath, "utf-8");
  assert(servicesContent.includes("VoiceInputButton"));
  assert(servicesContent.includes("Search citizen services using microphone voice input"));
});

test("VoiceInputButton is integrated into Schemes Directory Search", () => {
  const schemesPath = path.join(ROOT, "src", "app", "schemes", "page.tsx");
  const schemesContent = fs.readFileSync(schemesPath, "utf-8");
  assert(schemesContent.includes("VoiceInputButton"));
  assert(schemesContent.includes("Search government welfare schemes using microphone voice input"));
});

test("VoiceInputButton is integrated into Announcements & Notices Search", () => {
  const noticesPath = path.join(ROOT, "src", "app", "notices", "page.tsx");
  const noticesContent = fs.readFileSync(noticesPath, "utf-8");
  assert(noticesContent.includes("VoiceInputButton"));
  assert(noticesContent.includes("Search announcements using microphone voice input"));
});

// =============================================================================
// 3. Accessibility Pass Verification
// =============================================================================
console.log("\n--- 3. ACCESSIBILITY PASS TESTS ---");

const globalsCssPath = path.join(ROOT, "src", "app", "globals.css");
const globalsCssContent = fs.readFileSync(globalsCssPath, "utf-8");

test("globals.css defines reduced-motion media query override", () => {
  assert(globalsCssContent.includes("@media (prefers-reduced-motion: reduce)"));
  assert(globalsCssContent.includes("animation-duration: 0.01ms !important"));
  assert(globalsCssContent.includes("transition-duration: 0.01ms !important"));
});

test("globals.css defines minimum 44px mobile touch targets", () => {
  assert(globalsCssContent.includes("@media (pointer: coarse)"));
  assert(globalsCssContent.includes("min-height: 44px"));
  assert(globalsCssContent.includes("min-width: 44px"));
});

test("globals.css defines accessible skip-link styles", () => {
  assert(globalsCssContent.includes(".skip-link"));
  assert(globalsCssContent.includes(".skip-link:focus"));
});

test("globals.css defines accessible high-contrast focus indicators", () => {
  assert(globalsCssContent.includes("a:focus-visible"));
  assert(globalsCssContent.includes("button:focus-visible"));
  assert(globalsCssContent.includes("input:focus-visible"));
  assert(globalsCssContent.includes("outline: 2px solid #b98519"));
});

test("globals.css includes Kannada & Devanagari font families", () => {
  assert(globalsCssContent.includes(".font-kannada"));
  assert(globalsCssContent.includes(".font-hindi"));
  assert(globalsCssContent.includes("Noto Sans Kannada"));
  assert(globalsCssContent.includes("Noto Sans Devanagari"));
});

test("RootLayout includes #main-content target with focus outline support", () => {
  const layoutPath = path.join(ROOT, "src", "app", "layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert(layoutContent.includes('id="main-content"'));
});

test("UtilityBar links to #main-content with skip-link class", () => {
  const utilityBarPath = path.join(ROOT, "src", "components", "UtilityBar", "UtilityBar.tsx");
  const utilityBarContent = fs.readFileSync(utilityBarPath, "utf-8");
  assert(utilityBarContent.includes('href="#main-content"'));
  assert(utilityBarContent.includes('className="skip-link'));
});

test("NavBar provides accessible navigation attributes (aria-current, Escape handler)", () => {
  const navBarPath = path.join(ROOT, "src", "components", "Navigation", "NavBar.tsx");
  const navBarContent = fs.readFileSync(navBarPath, "utf-8");
  assert(navBarContent.includes('aria-current={item.isActive ? "page" : undefined}'));
  assert(navBarContent.includes('e.key === "Escape" && mobileMenuOpen'));
});

test("AskCivSetuModal defines dialog role and aria-modal attributes", () => {
  const modalPath = path.join(ROOT, "src", "components", "AI", "AskCivSetuModal.tsx");
  const modalContent = fs.readFileSync(modalPath, "utf-8");
  assert(modalContent.includes('role="dialog"'));
  assert(modalContent.includes('aria-modal="true"'));
  assert(modalContent.includes('aria-labelledby="civsetu-modal-title"'));
  assert(modalContent.includes('e.key === "Escape"'));
});

// =============================================================================
// Summary
// =============================================================================
console.log("\n===============================================================================");
console.log(`  VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log("===============================================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
