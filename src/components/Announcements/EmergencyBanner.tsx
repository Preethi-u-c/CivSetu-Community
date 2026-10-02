"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, X, Volume2 } from "lucide-react";
import { NoticeRecord } from "@/lib/db/notices";

export const EmergencyBanner: React.FC = () => {
  const [emergencyAlerts, setEmergencyAlerts] = useState<NoticeRecord[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/notices?isEmergency=true&limit=3")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setEmergencyAlerts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  if (emergencyAlerts.length === 0 || dismissed) {
    return null;
  }

  const latestAlert = emergencyAlerts[0];

  return (
    <div className="bg-rose-600 text-white shadow-md relative overflow-hidden border-b border-rose-700">
      <div className="max-w-[1380px] mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="p-1 rounded bg-rose-700 text-white flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
          </span>
          <span className="font-black uppercase tracking-wider bg-rose-800 text-rose-100 text-[10px] px-2 py-0.5 rounded">
            EMERGENCY CIVIC ALERT
          </span>
          <p className="font-bold line-clamp-1">
            {latestAlert.title}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <Link
            href={`/notices/${latestAlert.id}`}
            prefetch={true}
            className="inline-flex items-center gap-1 font-extrabold bg-white text-rose-700 hover:bg-rose-50 px-3 py-1 rounded text-xs transition shadow-sm"
          >
            <span>Read Official Directive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-rose-200 hover:text-white hover:bg-rose-700 transition"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
