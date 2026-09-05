"use client";

import React from "react";

export const StateEmblem: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* High-fidelity Vector Representation of Karnataka State Gandaberunda Emblem */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
        role="img"
        aria-label="Karnataka State Emblem - Gandaberunda"
      >
        {/* Outer Laurel / Wreath Gold Ring */}
        <circle cx="60" cy="60" r="54" stroke="#B98519" strokeWidth="2.5" strokeDasharray="3 2" />
        
        {/* Red / Crimson Base Shield */}
        <rect x="25" y="32" width="70" height="58" rx="6" fill="#A11D23" stroke="#B98519" strokeWidth="2" />
        
        {/* Top Ashoka Lions Crown */}
        <path d="M50 16H70V24H50V16Z" fill="#B98519" />
        <circle cx="60" cy="18" r="4" fill="#FBF3DC" />
        <path d="M52 24L60 29L68 24H52Z" fill="#D39B22" />
        <circle cx="60" cy="28" r="1.5" fill="#1E3A8A" />

        {/* Gandaberunda Double-Headed Eagle Body */}
        <path
          d="M60 40C54 44 48 48 48 56C48 64 54 70 60 74C66 70 72 64 72 56C72 48 66 44 60 40Z"
          fill="#FDE68A"
          stroke="#B98519"
          strokeWidth="1.5"
        />
        {/* Left Head */}
        <path d="M55 42C51 40 45 42 44 46C46 47 49 46 51 48" fill="#FDE68A" stroke="#B98519" strokeWidth="1.5" />
        {/* Right Head */}
        <path d="M65 42C69 40 75 42 76 46C74 47 71 46 69 48" fill="#FDE68A" stroke="#B98519" strokeWidth="1.5" />

        {/* Lion Supporters */}
        {/* Left Lion Supporter */}
        <path
          d="M26 44C29 48 33 55 35 64C32 68 30 76 28 82C34 83 40 81 44 76"
          stroke="#EAB308"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Right Lion Supporter */}
        <path
          d="M94 44C91 48 87 55 85 64C88 68 90 76 92 82C86 83 80 81 76 76"
          stroke="#EAB308"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Bottom Satyameva Jayate Ribbon Banner */}
        <path
          d="M20 92C38 90 82 90 100 92L94 98C80 96 40 96 26 98L20 92Z"
          fill="#B98519"
          stroke="#78350F"
          strokeWidth="1"
        />
        {/* Motto Dots */}
        <circle cx="50" cy="94" r="1" fill="#FFFFFF" />
        <circle cx="60" cy="94" r="1.2" fill="#FFFFFF" />
        <circle cx="70" cy="94" r="1" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
