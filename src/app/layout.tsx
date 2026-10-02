import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { AuthProvider } from "@/context/AuthContext";
import { UtilityBar } from "@/components/UtilityBar/UtilityBar";
import { MainHeader } from "@/components/Header/MainHeader";
import { NavBar } from "@/components/Navigation/NavBar";
import { Footer } from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "CivSetu | Lakshmeshwar Town Municipal Council (TMC)",
  description:
    "Official Civic Portal of Lakshmeshwar Town Municipal Council, Urban Development Department, Government of Karnataka. Citizen services, ward map, public notices, and grievance redressal.",
  keywords: [
    "CivSetu",
    "Lakshmeshwar",
    "Town Municipal Council",
    "Karnataka",
    "Gadag",
    "Citizen Services",
    "Purasabe",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth text-scale-normal m-0 p-0">
      <body className="min-h-screen flex flex-col m-0 p-0 bg-[#FBF9F4] dark:bg-[#081816] text-[#17201F] dark:text-[#E2E8F0] antialiased">
        <AccessibilityProvider>
          <AuthProvider>
            {/* 1. Top Utility / Accessibility Bar */}
            <UtilityBar />

            {/* 2. Main Brand Header */}
            <MainHeader />

            {/* 3. Main Navigation */}
            <NavBar />

            {/* Main Content Area */}
            <main id="main-content" className="flex-1 focus:outline-none">
              {children}
            </main>

            {/* 9 & 10. Website Policy Bar & Final Ownership Footer */}
            <Footer />
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
