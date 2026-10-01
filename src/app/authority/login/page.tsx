"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function AuthorityLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      title: "Chief Officer",
      name: "Sri. Basavaraj Patil",
      email: "commissioner@lakshmeshwar-tmc.gov.in",
      role: "Municipal Commissioner",
    },
    {
      title: "Water Supply Engineer",
      name: "Smt. Sujata Deshmukh",
      email: "aee.water@lakshmeshwar-tmc.gov.in",
      role: "Assistant Executive Engineer",
    },
    {
      title: "Health Inspector",
      name: "Sri. Manjunath Gouda",
      email: "health.sanitation@lakshmeshwar-tmc.gov.in",
      role: "Sanitation Supervisor",
    },
    {
      title: "Electrical Engineer",
      name: "Sri. Ramesh Kulkarni",
      email: "electrical@lakshmeshwar-tmc.gov.in",
      role: "Junior Engineer (Lighting)",
    },
  ];

  const handleDemoSelect = (email: string) => {
    setIdentifier(email);
    setPassword("Authority@Pass2026");
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Please provide your official officer email or Staff ID and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/authority/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please verify officer credentials.");
        return;
      }

      // Navigate to Authority Dashboard
      window.location.href = "/authority/dashboard";
    } catch {
      setError("Network communication error with authority authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#031514] text-gray-900 dark:text-gray-100 flex flex-col justify-between">
      {/* Official Government Advisory Top Bar */}
      <header className="bg-[#042f2e] text-teal-100 text-xs py-2.5 px-4 border-b border-teal-900">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">
              Lakshmeshwar Town Municipal Council (TMC) • Gadag District, Karnataka
            </span>
          </div>
          <span className="text-teal-300 font-medium">Official Administrative Services Gateway</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="max-w-md w-full bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Emblem & Portal Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#064E4A] text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-teal-600/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                CivSetu Authority Portal
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Authorized Municipal Officers & Department Staff Sign-In
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="officer-identifier"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1"
              >
                Officer Email / Staff ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="officer-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. commissioner@lakshmeshwar-tmc.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/80 focus:outline-none focus:border-[#064E4A] focus:ring-1 focus:ring-[#064E4A]"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="officer-password"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1"
              >
                Security Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="officer-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/80 focus:outline-none focus:border-[#064E4A] focus:ring-1 focus:ring-[#064E4A]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-3 rounded-xl transition shadow hover:shadow-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Municipal Officer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Municipal Officer Profiles (Testing)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoSelect(acc.email)}
                  className="p-2.5 text-left border border-teal-100 dark:border-teal-900 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 transition group"
                >
                  <p className="font-bold text-[#064E4A] dark:text-teal-300 group-hover:underline">
                    {acc.title}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{acc.name}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 text-center">
              Password for demo accounts: <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">Authority@Pass2026</code>
            </p>
          </div>

          {/* Return link */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-[#064E4A] dark:text-teal-400 font-semibold hover:underline"
            >
              ← Return to Citizen Login
            </Link>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-900">
        <p>Lakshmeshwar Town Municipal Council • Karnataka Municipal Data Protection & Integrity</p>
      </footer>
    </div>
  );
}
