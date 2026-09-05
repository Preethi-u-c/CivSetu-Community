"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { User, Lock, Shield, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"citizen" | "official">("citizen");

  return (
    <PageContainer
      title="CivSetu Portal Authentication"
      subtitle="Secure sign-in for Citizens, Municipal Staff, and Lakshmeshwar TMC Administrators"
      breadcrumbs={[{ label: "Login" }]}
    >
      <div className="max-w-md mx-auto py-4">
        {/* Role Selector Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setRole("citizen")}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
              role === "citizen"
                ? "border-[#064E4A] text-[#064E4A] dark:text-teal-400 dark:border-teal-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Citizen Login
          </button>
          <button
            onClick={() => setRole("official")}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition ${
              role === "official"
                ? "border-[#064E4A] text-[#064E4A] dark:text-teal-400 dark:border-teal-400"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Officer / Staff Login
          </button>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              {role === "citizen" ? "Registered Mobile Number" : "Employee / KGID Number"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type={role === "citizen" ? "tel" : "text"}
                placeholder={role === "citizen" ? "Enter 10-digit mobile number" : "Enter KGID or Official ID"}
                className="w-full pl-9 pr-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              {role === "citizen" ? "OTP or Password" : "Secure Password"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600 text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span>Remember this session</span>
            </label>
            <a href="#" className="text-[#064E4A] dark:text-teal-400 hover:underline">
              Forgot credentials?
            </a>
          </div>

          {role === "official" ? (
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-2.5 rounded-md transition shadow text-center"
            >
              <span>Access Municipal Administration Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/track"
              className="w-full flex items-center justify-center gap-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-2.5 rounded-md transition shadow text-center"
            >
              <span>Proceed to Citizen Tracking Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </form>

        <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-800 dark:text-amber-300 text-center flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Phase 2 Operating Mode</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            Citizen registration and credential verification will be activated in Phase 3. Municipal staff
            can access all administrative desks via the direct management portal.
          </p>
          <Link
            href="/admin"
            className="mt-1 font-bold underline hover:text-amber-950 dark:hover:text-amber-200"
          >
            Launch Officer Administrative Desks →
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
