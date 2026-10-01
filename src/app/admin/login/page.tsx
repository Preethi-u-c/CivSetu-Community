"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Landmark,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/admin/dashboard";

  const [identifier, setIdentifier] = useState(
    process.env.NODE_ENV === "development" ? "admin" : ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please provide administrator username/email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Invalid administrator credentials.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Validate safe relative redirect
      const safeRedirect = redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : "/admin/dashboard";

      setTimeout(() => {
        router.push(safeRedirect);
      }, 500);
    } catch (err) {
      console.error("Login submission error:", err);
      setError("Network or server connection failed. Please check backend services.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041211] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-teal-900/60 bg-[#061F1D]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center group-hover:scale-105 transition shadow-inner">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-wide block">CivSetu Community</span>
              <span className="text-xs text-teal-300 block">Lakshmeshwar Town Municipal Council</span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-teal-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>Return to Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#061F1D] border border-teal-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-900/50 border border-amber-400/30 text-amber-400 mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Administrator Login
            </h1>
            <p className="text-xs text-teal-200 mt-1">
              Restricted Control Desk • Lakshmeshwar TMC
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Authenticated successfully. Redirecting to workspace...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label htmlFor="admin-identifier" className="block text-xs font-bold uppercase tracking-wider text-teal-200 mb-1.5">
                Username or Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-identifier"
                  name="username"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@lakshmeshwar-tmc.gov.in"
                  autoComplete="username"
                  required
                  autoFocus
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#041211] border border-teal-800 text-white placeholder-teal-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-teal-200 mb-1.5">
                Administrative Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrative password"
                  autoComplete="current-password"
                  required
                  disabled={loading || success}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#041211] border border-teal-800 text-white placeholder-teal-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-teal-400 hover:text-teal-200 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-stone-950" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Advisory */}
          <div className="mt-6 pt-5 border-t border-teal-900/60 text-center">
            <p className="text-[11px] text-teal-300/80 leading-relaxed">
              Official use only. Unauthorized administrative access attempts are recorded in municipal audit logs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-teal-400/80 border-t border-teal-900/60">
        <p>© 2026 Lakshmeshwar Town Municipal Council (ಪುರಸಭೆ ಲಕ್ಷ್ಮೇಶ್ವರ). CivSetu Civic Governance Platform.</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#032220] flex items-center justify-center text-teal-200 text-sm">
          Loading administrator workspace...
        </div>
      }
    >
      <AdminLoginContent />
    </React.Suspense>
  );
}

