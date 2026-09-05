export interface WardInfo {
  wardNumber: number;
  name: string;
  nameKn: string;
  representative: string;
  contact: string;
  population: number;
  color: string;
  landmarks: string[];
}

export const wardsData: WardInfo[] = [
  {
    wardNumber: 1,
    name: "Ward 1 - Someshwara Temple Area",
    nameKn: "ವಾರ್ಡ್ ೧ - ಸೋಮೇಶ್ವರ ದೇವಸ್ಥಾನ ಪ್ರದೇಶ",
    representative: "Smt. Shanta Patil",
    contact: "08382-272077",
    population: 2340,
    color: "#FDE68A", // Soft Yellow
    landmarks: ["Someshwara Temple", "Kalyani Pond"],
  },
  {
    wardNumber: 2,
    name: "Ward 2 - Market Road",
    nameKn: "ವಾರ್ಡ್ ೨ - ಮಾರುಕಟ್ಟೆ ರಸ್ತೆ",
    representative: "Shri. Ramesh Badiger",
    contact: "08382-272077",
    population: 2610,
    color: "#FED7AA", // Peach
    landmarks: ["APMC Market", "Gandhi Chowk"],
  },
  {
    wardNumber: 3,
    name: "Ward 3 - Fort & Jain Basti",
    nameKn: "ವಾರ್ಡ್ ೩ - ಕೋಟೆ ಮತ್ತು ಜೈನ ಬಸದಿ",
    representative: "Shri. Anand Hosamani",
    contact: "08382-272077",
    population: 2150,
    color: "#FBCFE8", // Soft Pink
    landmarks: ["Shanka Basadi", "Historical Fort Wall"],
  },
  {
    wardNumber: 7,
    name: "Ward 7 - Bus Stand Area",
    nameKn: "ವಾರ್ಡ್ ೭ - ಬಸ್ ನಿಲ್ದಾಣ ಪ್ರದೇಶ",
    representative: "Smt. Geeta Kulkarni",
    contact: "08382-272077",
    population: 2890,
    color: "#BAE6FD", // Light Sky Blue
    landmarks: ["KSRTC Bus Stand", "Town Library"],
  },
  {
    wardNumber: 8,
    name: "Ward 8 - Purasabe Colony",
    nameKn: "ವಾರ್ಡ್ ೮ - ಪುರಸಭೆ ಬಡಾವಣೆ",
    representative: "Shri. Manjunath Gadag",
    contact: "08382-272077",
    population: 1980,
    color: "#BBF7D0", // Light Green
    landmarks: ["Purasabe Office", "Taluk Hospital"],
  },
  {
    wardNumber: 9,
    name: "Ward 9 - Shigli Road",
    nameKn: "ವಾರ್ಡ್ ೯ - ಶಿಗಲಿ ರಸ್ತೆ",
    representative: "Smt. Renuka Angadi",
    contact: "08382-272077",
    population: 2450,
    color: "#DDD6FE", // Lavender
    landmarks: ["Government Junior College", "Water Filtration Unit"],
  },
  {
    wardNumber: 12,
    name: "Ward 12 - Vidya Nagar",
    nameKn: "ವಾರ್ಡ್ ೧೨ - ವಿದ್ಯಾನಗರ",
    representative: "Shri. Basavaraj Bellad",
    contact: "08382-272077",
    population: 2200,
    color: "#FDE68A",
    landmarks: ["Public Park", "Polytechnic College"],
  },
  {
    wardNumber: 13,
    name: "Ward 13 - Station Road",
    nameKn: "ವಾರ್ಡ್ ೧೩ - ಸ್ಟೇಷನ್ ರಸ್ತೆ",
    representative: "Shri. Suresh Hubli",
    contact: "08382-272077",
    population: 2780,
    color: "#FECDD3", // Soft Rose
    landmarks: ["Commercial Complex", "Community Hall"],
  },
  {
    wardNumber: 14,
    name: "Ward 14 - Industrial Area",
    nameKn: "ವಾರ್ಡ್ ೧೪ - ಕೈಗಾರಿಕಾ ಪ್ರದೇಶ",
    representative: "Smt. Pushpa Doddagoudar",
    contact: "08382-272077",
    population: 1890,
    color: "#FEF08A",
    landmarks: ["Gin Factory Road", "Sub-Station"],
  },
  {
    wardNumber: 18,
    name: "Ward 18 - Magadi Extension",
    nameKn: "ವಾರ್ಡ್ ೧೮ - ಮಾಗಡಿ ಬಡಾವಣೆ",
    representative: "Shri. Chandrashekhar Hiremath",
    contact: "08382-272077",
    population: 2110,
    color: "#A7F3D0",
    landmarks: ["Veterinary Clinic", "Primary Health Center"],
  },
];
