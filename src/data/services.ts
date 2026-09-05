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
    id: "citizen-services",
    title: "Citizen Services",
    titleKn: "ನಾಗರಿಕ ಸೇವೆಗಳು",
    description: "Water supply, property tax (Khata/Sasya), trade licenses, sanitation, and streetlights.",
    descriptionKn: "ಕುಡಿಯುವ ನೀರು, ಆಸ್ತಿ ತೆರಿಗೆ (ಖಾತಾ), ವ್ಯಾಪಾರ ಪರವಾನಗಿ, ನೈರ್ಮಲ್ಯ ಮತ್ತು ಬೀದಿದೀಪ ಸೇವೆಗಳು.",
    href: "/citizen-services",
    iconName: "UserCheck",
    bgColor: "bg-[#4D7C0F]", // Olive Green
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
