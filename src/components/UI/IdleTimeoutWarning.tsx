"use client";

import React from "react";
import { Clock, ShieldAlert } from "lucide-react";

interface IdleTimeoutWarningProps {
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function IdleTimeoutWarning({
  remainingSeconds,
  onStayLoggedIn,
  onLogout,
}: IdleTimeoutWarningProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#041211] border border-amber-500/40 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-amber-950/60 p-5 border-b border-amber-900/40 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Session Expiring
            </h3>
            <p className="text-sm text-teal-100/80 mt-1 leading-relaxed">
              You have been inactive for a while. For your security, you will be automatically logged out in:
            </p>
            <div className="text-3xl font-mono font-bold text-amber-400 mt-3 tracking-wider">
              {timeString}
            </div>
          </div>
        </div>
        
        <div className="p-5 flex flex-col sm:flex-row gap-3 justify-end bg-[#06211f]">
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-sm font-bold text-red-300 hover:text-red-200 hover:bg-red-950/40 border border-transparent hover:border-red-900/60 transition"
          >
            Logout Now
          </button>
          <button
            onClick={onStayLoggedIn}
            className="px-6 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/20 transition"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
