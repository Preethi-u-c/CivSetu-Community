import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          950: "#022422",
          900: "#064E4A", // Primary Dark Teal
          800: "#095C57",
          700: "#0B6B63", // Secondary Teal
          600: "#0E837A",
          100: "#E6F3F1",
          50: "#F0F8F6",
        },
        gold: {
          700: "#9A6E12",
          600: "#B98519", // Civic Gold
          500: "#D39B22",
          100: "#FBF3DC",
        },
        civic: {
          dark: "#064E4A",
          teal: "#0B6B63",
          gold: "#B98519",
          cream: "#FBF9F4",
          surface: "#F4F8F7",
          text: "#17201F",
          muted: "#5F6866",
          border: "#D8E3E0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
