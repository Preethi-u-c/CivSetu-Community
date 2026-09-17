export interface QuickService {
  id: string;
  title: string;
  titleKn: string;
  description: string;
  descriptionKn: string;
  href: string;
  iconName: "Users" | "UserCheck" | "Briefcase" | "FileText";
  bgColor: string; // Background circle color
  textColor: string;
}

export const quickServices: QuickService[] = [
  {
    id: "members",
    title: "Know Your Members",
    titleKn: "ನಿಮ್ಮ ಸದಸ್ಯರನ್ನು ತಿಳಿಯಿರಿ",
    description: "Elected council representatives, ward corporators, and committee heads.",
    descriptionKn: "ಚುನಾಯಿತ ಪುರಸಭಾ ಸದಸ್ಯರು, ವಾರ್ಡ್ ಪ್ರತಿನಿಧಿಗಳು ಮತ್ತು ಸಮಿತಿ ಮುಖ್ಯಸ್ಥರು.",
    href: "/members",
    iconName: "Users",
    bgColor: "bg-[#064E4A]", // Dark Teal
    textColor: "text-white",
  },
  {
    id: "wards",
    title: "Know Your Wards",
    titleKn: "ನಿಮ್ಮ ವಾರ್ಡ್‌ಗಳನ್ನು ತಿಳಿಯಿರಿ",
    description: "Explore the 23 administrative wards of Lakshmeshwar Town Municipal Council and their available population and geographic information.",
    descriptionKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪಟ್ಟಣ ಪುರಸಭೆಯ 23 ಆಡಳಿತಾತ್ಮಕ ವಾರ್ಡ್‌ಗಳು ಮತ್ತು ಲಭ್ಯವಿರುವ ಜನಸಂಖ್ಯೆ ಹಾಗೂ ಭೌಗೋಳಿಕ ಮಾಹಿತಿಯನ್ನು ತಿಳಿಯಿರಿ.",
    href: "/wards",
    iconName: "UserCheck",
    bgColor: "bg-[#4D7C0F]",
    textColor: "text-white",
  },
  {
    id: "applications",
    title: "Applications for various services",
    titleKn: "ವಿವಿಧ ಸೇವೆಗಳ ಅರ್ಜಿಗಳು",
    description: "Download and submit official municipal forms, NOCs, birth & death registration forms.",
    descriptionKn: "ಅಧಿಕೃತ ಪುರಸಭೆ ನಮೂನೆಗಳು, ಎನ್.ಒ.ಸಿ ಮತ್ತು ಜನನ-ಮರಣ ನೋಂದಣಿ ಅರ್ಜಿಗಳು.",
    href: "/applications",
    iconName: "Briefcase",
    bgColor: "bg-[#B45309]", // Amber / Warm Brown
    textColor: "text-white",
  },
  {
    id: "city-summary",
    title: "City Summary",
    titleKn: "ನಗರ ಸಾರಾಂಶ",
    description: "Demographics, ward master list, town history, monuments, and statistical overview.",
    descriptionKn: "ಜನಸಂಖ್ಯೆ, ವಾರ್ಡ್ ವಿವರಗಳು, ಪಟ್ಟಣದ ಇತಿಹಾಸ, ಸ್ಮಾರಕಗಳು ಮತ್ತು ಅಂಕಿ-ಅಂಶಗಳ ವಿವರ.",
    href: "/city-summary",
    iconName: "FileText",
    bgColor: "bg-[#0F766E]", // Medium Teal
    textColor: "text-white",
  },
];
