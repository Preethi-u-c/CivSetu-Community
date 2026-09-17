export type Language = "en" | "kn";

export interface TranslationDictionary {
  topBar: {
    login: string;
    register?: string;
    pigrs: string;
    whatsapp: string;
    skipToMain: string;
    screenReader: string;
    english: string;
    kannada: string;
    textSize: string;
    toggleTheme: string;
  };
  header: {
    stateGov: string;
    dept: string;
    portalName: string;
    subTitle: string;
  };
  nav: {
    home: string;
    aboutUs: string;
    contactUs: string;
    login: string;
    register?: string;
  };
  officials: {
    heading: string;
    viewProfile: string;
  };
  services: {
    heading: string;
    members: string;
    citizenServices: string;
    applications: string;
    citySummary: string;
  };
  map: {
    heading: string;
    title: string;
    zoomIn: string;
    zoomOut: string;
    fullscreen: string;
    viewDetails: string;
  };
  relatedLinks: {
    heading: string;
  };
  info: {
    visitors: string;
    whatsNew: string;
    contactUs: string;
    totalVisitors: string;
    uniqueVisitors: string;
    registeredUsers: string;
    lastRegisteredUser: string;
    publishedNotice: string;
    yourIp: string;
    since: string;
    releaseVersion: string;
  };
  policy: {
    websitePolicies: string;
    sitemap: string;
    copyrightPolicy: string;
    hyperlinkingPolicy: string;
    privacyPolicy: string;
    securityPolicy: string;
    termsAndConditions: string;
    help: string;
    disclaimer: string;
    feedback: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    topBar: {
      login: "Login",
      register: "Register",
      pigrs: "PIGRS number : 1902",
      whatsapp: "Whatsapp No :-",
      skipToMain: "Skip to main content",
      screenReader: "Screen Reader Access",
      english: "English",
      kannada: "ಕನ್ನಡ",
      textSize: "Text Size",
      toggleTheme: "Toggle Theme",
    },
    header: {
      stateGov: "Government of Karnataka",
      dept: "Urban Development Department",
      portalName: "CivSetu",
      subTitle: "Lakshmeshwar Town Municipal Council",
    },
    nav: {
      home: "Home",
      aboutUs: "About Us",
      contactUs: "Contact Us",
      login: "Login",
      register: "Register",
    },
    officials: {
      heading: "Key Dignitaries & Officials",
      viewProfile: "View Profile",
    },
    services: {
      heading: "Quick Services",
      members: "Know Your Members",
      citizenServices: "Citizen Services",
      applications: "Applications for various services",
      citySummary: "City Summary",
    },
    map: {
      heading: "Wardwise Google Map",
      title: "Lakshmeshwar Town Municipal Council - Ward Map",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      fullscreen: "Fullscreen",
      viewDetails: "View Details",
    },
    relatedLinks: {
      heading: "Related Links",
    },
    info: {
      visitors: "Visitors",
      whatsNew: "What's New",
      contactUs: "Contact Us",
      totalVisitors: "Total Visitors",
      uniqueVisitors: "Unique Visitors",
      registeredUsers: "Registered Users",
      lastRegisteredUser: "Last Registered User",
      publishedNotice: "Published Notice",
      yourIp: "Your IP",
      since: "Since",
      releaseVersion: "Release Version",
    },
    policy: {
      websitePolicies: "Website Policies",
      sitemap: "Sitemap",
      copyrightPolicy: "Copyright Policy",
      hyperlinkingPolicy: "Hyperlinking Policy",
      privacyPolicy: "Privacy Policy",
      securityPolicy: "Security Policy",
      termsAndConditions: "Terms and Conditions",
      help: "Help",
      disclaimer: "Disclaimer",
      feedback: "Post Back & Suggestions",
    },
  },
  kn: {
    topBar: {
      login: "ಪ್ರವೇಶ (Login)",
      register: "ನೋಂದಣಿ (Register)",
      pigrs: "ಪಿ.ಐ.ಜಿ.ಆರ್.ಎಸ್ ಸಂಖ್ಯೆ : 1902",
      whatsapp: "ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ :-",
      skipToMain: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ",
      screenReader: "ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಪ್ರವೇಶ",
      english: "English",
      kannada: "ಕನ್ನಡ",
      textSize: "ಅಕ್ಷರದ ಗಾತ್ರ",
      toggleTheme: "ಥೀಮ್ ಬದಲಾಯಿಸಿ",
    },
    header: {
      stateGov: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
      dept: "ನಗರಾಭಿವೃದ್ಧಿ ಇಲಾಖೆ",
      portalName: "ಸಿವ್‌ಸೇತು",
      subTitle: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ",
    },
    nav: {
      home: "ಮುಖಪುಟ",
      aboutUs: "ನಮ್ಮ ಬಗ್ಗೆ",
      contactUs: "ಸಂಪರ್ಕಿಸಿ",
      login: "ಲಾಗಿನ್",
      register: "ನೋಂದಣಿ",
    },
    officials: {
      heading: "ಪ್ರಮುಖ ಗಣ್ಯರು ಮತ್ತು ಅಧಿಕಾರಿಗಳು",
      viewProfile: "ವಿವರ ವೀಕ್ಷಿಸಿ",
    },
    services: {
      heading: "ತ್ವರಿತ ಸೇವೆಗಳು",
      members: "ನಿಮ್ಮ ಸದಸ್ಯರನ್ನು ತಿಳಿಯಿರಿ",
      citizenServices: "ನಾಗರಿಕ ಸೇವೆಗಳು",
      applications: "ವಿವಿಧ ಸೇವೆಗಳ ಅರ್ಜಿಗಳು",
      citySummary: "ನಗರ ಸಾರಾಂಶ",
    },
    map: {
      heading: "ವಾರ್ಡ್‌ವಾರು ಗೂಗಲ್ ನಕ್ಷೆ",
      title: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ - ವಾರ್ಡ್ ನಕ್ಷೆ",
      zoomIn: "ಹಿಗ್ಗಿಸಿ",
      zoomOut: "ಕುಗ್ಗಿಸಿ",
      fullscreen: "ಪೂರ್ಣ ಪರದೆ",
      viewDetails: "ವಿವರಗಳು",
    },
    relatedLinks: {
      heading: "ಸಂಬಂಧಿತ ಕೊಂಡಿಗಳು",
    },
    info: {
      visitors: "ಸಂದರ್ಶಕರು",
      whatsNew: "ಹೊಸದೇನಿದೆ",
      contactUs: "ಸಂಪರ್ಕಿಸಿ",
      totalVisitors: "ಒಟ್ಟು ಸಂದರ್ಶಕರು",
      uniqueVisitors: "ವಿಶಿಷ್ಟ ಸಂದರ್ಶಕರು",
      registeredUsers: "ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು",
      lastRegisteredUser: "ಕೊನೆಯ ಬಳಕೆದಾರರು",
      publishedNotice: "ಪ್ರಕಟಿತ ಸೂಚನೆಗಳು",
      yourIp: "ನಿಮ್ಮ ಐಪಿ",
      since: "ದಿನಾಂಕದಿಂದ",
      releaseVersion: "ಆವೃತ್ತಿ",
    },
    policy: {
      websitePolicies: "ವೆಬ್‌ಸೈಟ್ ನೀತಿಗಳು",
      sitemap: "ಸೈಟ್‌ಮ್ಯಾಪ್",
      copyrightPolicy: "ಕೃತಿಸ್ವಾಮ್ಯ ನೀತಿ",
      hyperlinkingPolicy: "ಹೈಪರ್‌ಲಿಂಕ್ ನೀತಿ",
      privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ",
      securityPolicy: "ಭದ್ರತಾ ನೀತಿ",
      termsAndConditions: "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು",
      help: "ಸಹಾಯ",
      disclaimer: "ಹಕ್ಕುತ್ಯಾಗ",
      feedback: "ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ಸಲಹೆಗಳು",
    },
  },
};
