export interface SiteConfig {
  name: string;
  nameKn: string;
  tagline: string;
  municipality: string;
  municipalityKn: string;
  department: string;
  departmentKn: string;
  stateGov: string;
  stateGovKn: string;
  pigrsNumber: string;
  whatsappNumber: string;
  contactNumber: string;
  contactNumberAlt: string;
  email: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  releaseVersion: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    whatsapp: string;
  };
  visitorStats: {
    totalVisitors: number;
    uniqueVisitors: number;
    registeredUsers: number;
    lastRegisteredUser: string;
    publishedNotices: number;
    ipPlaceholder: string;
    sinceDate: string;
  };
  footerAttribution: {
    contentOwnedBy: string;
    developedBy: string;
    contactPerson: string;
    councilName: string;
    contactNumber: string;
    email: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "CivSetu",
  nameKn: "ಸಿವ್‌ಸೇತು",
  tagline: "Lakshmeshwar Town Municipal Council",
  municipality: "Lakshmeshwar Town Municipal Council",
  municipalityKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ",
  department: "Urban Development Department",
  departmentKn: "ನಗರಾಭಿವೃದ್ಧಿ ಇಲಾಖೆ",
  stateGov: "Government of Karnataka",
  stateGovKn: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
  pigrsNumber: "1902",
  whatsappNumber: "",
  contactNumber: "08382-272077",
  contactNumberAlt: "03382-272077",
  email: "tmlakshmeshwara@gmail.com",
  address: {
    line1: "Near S.T. Stand, Lakshmeshwar",
    line2: "Gadag Dist.",
    city: "Lakshmeshwar",
    district: "Gadag",
    state: "Karnataka",
    pincode: "582116",
  },
  releaseVersion: "1.0.0",
  socials: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    whatsapp: "https://wa.me/918382272077",
  },
  visitorStats: {
    totalVisitors: 12560,
    uniqueVisitors: 92,
    registeredUsers: 2,
    lastRegisteredUser: "aarthoni_online",
    publishedNotices: 287,
    ipPlaceholder: "202.142.xx.xx (Privacy Protected)",
    sinceDate: "27/Feb/2024 - 10:07",
  },
  footerAttribution: {
    contentOwnedBy: "Lakshmeshwar Town Municipal Council, TMC",
    developedBy: "Karnataka Municipal Data Society, UDD, Bengaluru",
    contactPerson: "The Commissioner",
    councilName: "LAKSHMESHWAR TOWN MUNICIPAL COUNCIL",
    contactNumber: "08382-272077",
    email: "tmlakshmeshwara@gmail.com",
  },
};
