export interface Notice {
  id: string;
  title: string;
  titleKn: string;
  relativeTime: string;
  relativeTimeKn: string;
  date: string;
  slug: string;
  category: string;
  categoryKn: string;
  content: string;
  contentKn: string;
  fileUrl?: string;
}

export const notices: Notice[] = [
  {
    id: "1",
    title: "Jalashri Kalyana",
    titleKn: "ಜಲಶ್ರೀ ಕಲ್ಯಾಣ ಯೋಜನೆ",
    relativeTime: "1 year 2 months ago",
    relativeTimeKn: "1 ವರ್ಷ 2 ತಿಂಗಳ ಹಿಂದೆ",
    date: "2023-07-15",
    slug: "jalashri-kalyana",
    category: "Water Resources",
    categoryKn: "ಜಲ ಸಂಪನ್ಮೂಲ",
    content: "Implementation of Jalashri Kalyana Scheme for comprehensive urban water conservation, lake revival, and groundwater recharge across Lakshmeshwar TMC wards.",
    contentKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆಯ ಸಮಗ್ರ ನೀರು ಸಂರಕ್ಷಣೆ, ಕೆರೆ ಪುನಶ್ಚೇತನ ಮತ್ತು ಅಂತರ್ಜಲ ಮರುಪೂರಣಕ್ಕಾಗಿ ಜಲಶ್ರೀ ಕಲ್ಯಾಣ ಯೋಜನೆಯ ಅನುಷ್ಠಾನ.",
  },
  {
    id: "2",
    title: "Piped Drinking Water Supply",
    titleKn: "ಕೊಳವೆ ಮೂಲಕ ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು",
    relativeTime: "1 year 8 months ago",
    relativeTimeKn: "1 ವರ್ಷ 8 ತಿಂಗಳ ಹಿಂದೆ",
    date: "2023-01-10",
    slug: "piped-drinking-water-supply",
    category: "Public Utilities",
    categoryKn: "ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯ",
    content: "Dedicated 24x7 treated drinking water supply pipeline extension commissioned covering Ward 1 through Ward 18.",
    contentKn: "ವಾರ್ಡ್ 1 ರಿಂದ ವಾರ್ಡ್ 18 ರವರೆಗೆ ನಿರಂತರ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ ವಿಸ್ತರಣಾ ಕಾಮಗಾರಿ ಪೂರ್ಣಗೊಂಡಿದೆ.",
  },
  {
    id: "3",
    title: "LCDC",
    titleKn: "ಎಲ್‌ಸಿಡಿಸಿ ನಗರ ಅಭಿವೃದ್ಧಿ ಕೋಶ",
    relativeTime: "2 years 1 month ago",
    relativeTimeKn: "2 ವರ್ಷ 1 ತಿಂಗಳ ಹಿಂದೆ",
    date: "2022-08-01",
    slug: "lcdc",
    category: "Urban Planning",
    categoryKn: "ನಗರ ಯೋಜನೆ",
    content: "Local Council Development Cell (LCDC) notification regarding modern digital planning, GIS master mapping, and road widening guidelines.",
    contentKn: "ಡಿಜಿಟಲ್ ನಗರ ಯೋಜನೆ, ಜಿಐಎಸ್ ಮಾಸ್ಟರ್ ಮ್ಯಾಪಿಂಗ್ ಮತ್ತು ರಸ್ತೆ ಅಗಲೀಕರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಎಲ್‌ಸಿಡಿಸಿ ಅಧಿಸೂಚನೆ.",
  },
  {
    id: "4",
    title: "DMS",
    titleKn: "ಡಿ.ಎಂ.ಎಸ್ ಕಡತ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ",
    relativeTime: "2 years 1 month ago",
    relativeTimeKn: "2 ವರ್ಷ 1 ತಿಂಗಳ ಹಿಂದೆ",
    date: "2022-08-01",
    slug: "dms",
    category: "E-Governance",
    categoryKn: "ಇ-ಆಡಳಿತ",
    content: "Deployment of Digital Document Management System (DMS) for paperless municipal workflow, prompt certificate issuances, and grievance resolution tracking.",
    contentKn: "ಕಾಗದರಹಿತ ಪುರಸಭೆ ಕಡತ ನಿರ್ವಹಣೆ ಮತ್ತು ನಾಗರಿಕ ಅರ್ಜಿಗಳ ತ್ವರಿತ ವಿಲೇವಾರಿಗಾಗಿ ಡಿಜಿಟಲ್ ಡಾಕ್ಯುಮೆಂಟ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ ಸಿಸ್ಟಮ್ (ಡಿಎಂಎಸ್) ಅಳವಡಿಕೆ.",
  },
];
