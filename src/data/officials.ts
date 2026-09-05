export interface Official {
  id: string;
  name: string;
  nameKn: string;
  designation: string;
  designationKn: string;
  department: string;
  departmentKn: string;
  slug: string;
  image: string;
  office: string;
  phone?: string;
  email?: string;
  bio?: string;
}

export const officials: Official[] = [
  {
    id: "1",
    name: "Sri D.K. Shivakumar",
    nameKn: "ಶ್ರೀ ಡಿ.ಕೆ. ಶಿವಕುಮಾರ್",
    designation: "Hon'ble Deputy Chief Minister",
    designationKn: "ಮಾನ್ಯ ಉಪ ಮುಖ್ಯಮಂತ್ರಿಗಳು",
    department: "Government of Karnataka",
    departmentKn: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    slug: "dk-shivakumar",
    image: "/images/officials/dk-shivakumar.jpg",
    office: "Vidhana Soudha, Bengaluru",
    email: "deputym@karnataka.gov.in",
    bio: "Shri D.K. Shivakumar serves as the Deputy Chief Minister of Karnataka, spearheading major urban transformation and civic infrastructure developments across the state.",
  },
  {
    id: "2",
    name: "Sri M.C. Sudhakar",
    nameKn: "ಶ್ರೀ ಎಂ.ಸಿ. ಸುಧಾಕರ್",
    designation: "Hon'ble Minister for Municipal Administration",
    designationKn: "ಮಾನ್ಯ ಪೌರಾಡಳಿತ ಸಚಿವರು",
    department: "Govt. of Karnataka",
    departmentKn: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    slug: "mc-sudhakar",
    image: "/images/officials/mc-sudhakar.jpg",
    office: "Vikasa Soudha, Bengaluru",
    email: "minister-ma@karnataka.gov.in",
    bio: "Shri M.C. Sudhakar oversees urban local bodies, town municipal councils, and municipality governance statewide, promoting digital civic empowerment.",
  },
  {
    id: "3",
    name: "Sri. Sarangappa M",
    nameKn: "ಶ್ರೀ ಶರಣಗೌಡ ಎಂ",
    designation: "Administrator",
    designationKn: "ಆಡಳಿತಾಧಿಕಾರಿಗಳು",
    department: "Lakshmeshwar TMC",
    departmentKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ",
    slug: "sarangappa-m",
    image: "/images/officials/sarangappa-m.jpg",
    office: "Town Municipal Council, Lakshmeshwar",
    email: "administrator@lakshmeshwartmc.gov.in",
    bio: "Sri Sarangappa M serves as Administrator for Lakshmeshwar TMC, guiding administrative reforms, budget compliance, and public works initiatives.",
  },
  {
    id: "4",
    name: "Sri. Purushottam Gudadinni",
    nameKn: "ಶ್ರೀ ಪುರುಷೋತ್ತಮ ಗುಡದಿನ್ನಿ",
    designation: "Chief Officer",
    designationKn: "ಮುಖ್ಯಾಧಿಕಾರಿಗಳು",
    department: "Lakshmeshwar TMC",
    departmentKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ",
    slug: "purushottam-gudadinni",
    image: "/images/officials/purushottam-gudadinni.jpg",
    office: "Town Municipal Council, Lakshmeshwar",
    phone: "08382-272077",
    email: "tmlakshmeshwara@gmail.com",
    bio: "Sri Purushottam Gudadinni serves as the Chief Officer of Lakshmeshwar TMC, leading day-to-day municipal operations, sanitation, water distribution, and citizen grievance redressal.",
  },
];
