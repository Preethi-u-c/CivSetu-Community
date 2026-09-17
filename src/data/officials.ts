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
    image: "/forms/images/officials/dk-shivakumar.jpg",
    office: "Vidhana Soudha, Bengaluru",
    email: "deputym@karnataka.gov.in",
    bio: "Shri D.K. Shivakumar serves as the Deputy Chief Minister of Karnataka.",
  },

  {
    id: "2",
    name: "Sri H.C. Balakrishna",
    nameKn: "ಶ್ರೀ ಎಚ್.ಸಿ. ಬಾಲಕೃಷ್ಣ",
    designation: "Hon'ble Municipal Minister",
    designationKn: "ಮಾನ್ಯ ಪೌರಾಡಳಿತ ಸಚಿವರು",
    department: "Government of Karnataka",
    departmentKn: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    slug: "hc-balakrishna",
    image: "/forms/images/officials/hc-balakrishna.jpg",
    office: "Vikasa Soudha, Bengaluru",
    email: "minister-ma@karnataka.gov.in",
    bio: "Shri H.C. Balakrishna serves as the Hon'ble Municipal Minister of Karnataka.",
  },

  {
    id: "3",
    name: "Sri Gangappa M.",
    nameKn: "ಶ್ರೀ ಗಂಗಪ್ಪ ಎಂ.",
    designation: "Administrator",
    designationKn: "ಆಡಳಿತಾಧಿಕಾರಿಗಳು",
    department: "Lakshmeshwar Town Municipal Council",
    departmentKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ",
    slug: "gangappa-m",
    image: "/forms/images/officials/gangappa-m.jpg",
    office: "Town Municipal Council, Lakshmeshwar",
    email: "administrator@lakshmeshwartmc.gov.in",
    bio: "Sri Gangappa M. serves as Administrator of Lakshmeshwar Town Municipal Council.",
  },

  {
    id: "4",
    name: "Shri Parashuram Gudadari",
    nameKn: "ಶ್ರೀ ಪರಶುರಾಮ ಗುಡದಾರಿ",
    designation: "Chief Officer",
    designationKn: "ಮುಖ್ಯಾಧಿಕಾರಿಗಳು",
    department: "Lakshmeshwar Town Municipal Council",
    departmentKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ",
    slug: "parashuram-gudadari",
    image: "/forms/images/officials/parashuram-gudadari.jpg",
    office: "Town Municipal Council, Lakshmeshwar",
    phone: "08382-272077",
    email: "tmlakshmeshwara@gmail.com",
    bio: "Shri Parashuram Gudadari serves as the Chief Officer of Lakshmeshwar Town Municipal Council.",
  },
];