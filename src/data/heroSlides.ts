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
    title: "Someshwar Temple",
    titleKn: "ಸೋಮೇಶ್ವರ ದೇವಾಲಯ",
    description: "Historic temple heritage of Lakshmeshwar",
    image: "/forms/images/hero/Someshwar-temple.jpg",
    alt: "Someshwar Temple, Lakshmeshwar",
  },

  {
    id: 2,
    title: "Jain Temple",
    titleKn: "ಜೈನ ದೇವಾಲಯ",
    description: "Historic Jain temple architecture of Lakshmeshwar",
    image: "/forms/images/hero/Jain-temple.jpg",
    alt: "Jain Temple, Lakshmeshwar",
  },

  {
    id: 3,
    title: "Venkateshwar Temple",
    titleKn: "ವೆಂಕಟೇಶ್ವರ ದೇವಾಲಯ",
    description: "Religious and cultural heritage of Lakshmeshwar",
    image: "/forms/images/hero/Venkateshwar-temple.jpg",
    alt: "Venkateshwar Temple, Lakshmeshwar",
  },

  {
    id: 4,
    title: "Lakshmeshwar Town Municipal Council",
    titleKn: "ಲಕ್ಷ್ಮೇಶ್ವರ ಪುರಸಭೆ",
    description: "Lakshmeshwar Town Municipal Council",
    image: "/forms/images/hero/Purasabe-Lakshmeshwar.jpg",
    alt: "Lakshmeshwar Town Municipal Council office",
  },
];