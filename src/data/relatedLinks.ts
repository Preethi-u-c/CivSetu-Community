export interface RelatedLink {
  id: string;
  name: string;
  nameKn: string;
  url: string;
  bgColor: string;
  textColor: string;
  badgeText?: string;
  iconType: "state-emblem" | "bbmp" | "national-portal" | "kuidfc" | "cmak" | "udd";
}

export const relatedLinks: RelatedLink[] = [
  {
    id: "gok",
    name: "Government of Karnataka",
    nameKn: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    url: "https://karnataka.gov.in",
    bgColor: "bg-[#064E4A]", // Dark Teal
    textColor: "text-white",
    iconType: "state-emblem",
  },
  {
    id: "bbmp",
    name: "Bruhat Bengaluru Mahanagara Palike",
    nameKn: "ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ",
    url: "https://bbmp.gov.in",
    bgColor: "bg-[#0B6B63]", // Teal
    textColor: "text-white",
    iconType: "bbmp",
  },
  {
    id: "india-portal",
    name: "National Portal of India",
    nameKn: "ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ಪೋರ್ಟಲ್",
    url: "https://india.gov.in",
    bgColor: "bg-[#1E3A8A]", // Navy Blue
    textColor: "text-white",
    iconType: "national-portal",
  },
  {
    id: "kuidfc",
    name: "KUIDFC",
    nameKn: "ಕೆಯುಐಡಿಎಫ್‌ಸಿ",
    url: "https://kuidfc.karnataka.gov.in",
    bgColor: "bg-[#78350F]", // Olive / Amber Brown
    textColor: "text-white",
    iconType: "kuidfc",
  },
  {
    id: "cmak",
    name: "City Managers Association Karnataka",
    nameKn: "ಸಿಟಿ ಮ್ಯಾನೇಜರ್ಸ್ ಅಸೋಸಿಯೇಷನ್ ಕರ್ನಾಟಕ",
    url: "https://cmak.gov.in",
    bgColor: "bg-[#831843]", // Maroon / Magenta
    textColor: "text-white",
    iconType: "cmak",
  },
  {
    id: "udd",
    name: "Urban Development Department",
    nameKn: "ನಗರಾಭಿವೃದ್ಧಿ ಇಲಾಖೆ",
    url: "https://udd.karnataka.gov.in",
    bgColor: "bg-[#065F46]", // Forest Green
    textColor: "text-white",
    iconType: "udd",
  },
];
