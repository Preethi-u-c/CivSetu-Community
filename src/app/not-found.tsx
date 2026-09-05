import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <span className="text-3xl font-extrabold">404</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Page Not Found / ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ
      </h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto text-sm sm:text-base mb-8">
        The municipal portal page or document you are looking for does not exist,
        has been moved, or is temporarily unavailable.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          href="/citizen-services"
          className="flex items-center gap-2 bg-[#B98519] hover:bg-[#9E7013] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Browse Citizen Services</span>
        </Link>
      </div>
    </div>
  );
}
