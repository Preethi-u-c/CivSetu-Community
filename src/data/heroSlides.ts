export interface HeroSlide {
  id: number;
  title: string;
  titleKn: string;
  description: string;
  image: string;
  alt: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Historic Temple Gopuram",
    titleKn: "ಐತಿಹಾಸಿಕ ಸೋಮೇಶ್ವರ ದೇವಾಲಯ ಗೋಪುರ",
    description: "Architectural grandeur and heritage of ancient Lakshmeshwar",
    image: "/images/hero/gopuram.jpg",
    alt: "Colorful Gopuram of Someshwara Temple, Lakshmeshwar",
  },
  {
    id: 2,
    title: "Carved Stone Temple Complex",
    titleKn: "ಶಿಲಾ ಕೆತ್ತನೆಯ ಪ್ರಾಚೀನ ದೇವಾಲಯ",
    description: "Kalyana Chalukya style stone architecture and sanctum",
    image: "/images/hero/stone-temple.jpg",
    alt: "Ancient carved stone temple exterior in Lakshmeshwar",
  },
  {
    id: 3,
    title: "Temple Shikhara & Spire",
    titleKn: "ದೇವಾಲಯದ ಶಿಖರ ಮತ್ತು ಶಿಲ್ಪಕಲೆ",
    description: "Intricately stepped pyramidal shikhara displaying historic mastery",
    image: "/images/hero/shikhara.jpg",
    alt: "Detailed stepped stone shikhara of Lakshmeshwar temple",
  },
  {
    id: 4,
    title: "Purasabe Office, Lakshmeshwar",
    titleKn: "ಪುರಸಭೆ ಕಾರ್ಯಾಲಯ, ಲಕ್ಷ್ಮೇಶ್ವರ",
    description: "Serving citizens with dedication, governance, and transparency",
    image: "/images/hero/purasabe-office.jpg",
    alt: "Entrance gate of Lakshmeshwar Town Municipal Council (Purasabe)",
  },
];
