"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { validateStrongPassword } from "@/lib/security/validator";

export default function AdminForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = identifier.trim();
    if (!trimmed) {
      setIdentifierError("Please enter your administrator username or email.");
      return;
    }

    setIsSubmitting(true);
    setIdentifierError(null);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIdentifierError(data.error || "Failed to initiate administrator password recovery.");
        return;
      }

      setMaskedEmail(data.email || trimmed);
      setInfoMessage(data.message || "A 6-digit verification code has been dispatched.");
      setStep(2);
    } catch {
      setIdentifierError("A network error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setOtpError("Verification code must be exactly 6 digits.");
      return;
    }

    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), otp: cleanOtp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.error || "Invalid or expired verification code.");
        return;
      }

      setStep(3);
    } catch {
      setOtpError("A network error occurred while verifying the code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInfoMessage("A new verification code has been sent.");
      } else {
        setOtpError(data.error || "Failed to resend code. Please try again shortly.");
      }
    } catch {
      setOtpError("Network error while requesting new code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newPassword) {
      setPasswordError("New administrator password is required.");
      return;
    }

    const val = validateStrongPassword(newPassword);
    if (!val.isValid) {
      setPasswordError(val.errors[0]);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.error || "Failed to reset administrator password.");
        return;
      }

      setStep(4);
    } catch {
      setPasswordError("A network error occurred while updating password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020b0a] text-stone-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-amber-500 selection:text-stone-900">
      <div className="w-full max-w-md">
        {/* Portal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#062422] border border-teal-800 shadow-xl shadow-teal-950/40 mb-4 text-amber-400">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">CivSetu Administrative Portal</h1>
          <p className="text-xs text-teal-400 uppercase tracking-widest mt-1 font-semibold">
            Security Credential Recovery
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                    : step > s
                    ? "bg-teal-700 text-white"
                    : "bg-[#062422] border border-teal-800 text-teal-500"
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              <span className="text-[11px] font-semibold text-teal-300 hidden sm:inline">
                {s === 1 ? "Identify" : s === 2 ? "Verify" : "Reset"}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-[#041a18] border border-teal-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* STEP 1: Enter Username or Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  1. Enter Administrator Email
                </h2>
                <p className="text-xs text-teal-300/80 mb-4">
                  Please enter your official administrator email address to receive a secure 6-digit verification code.
                </p>

                {identifierError && (
                  <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{identifierError}</span>
                  </div>
                )}

                <label className="block text-xs font-bold uppercase tracking-wider text-teal-200 mb-1.5">
                  Administrator Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-teal-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (identifierError) setIdentifierError(null);
                    }}
                    placeholder="admin@gmail.com"
                    required
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#031211] border border-teal-800 text-white placeholder-teal-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Dispatching Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  2. Enter Verification Code
                </h2>
                <p className="text-xs text-teal-300/80 mb-4">
                  A 6-digit one-time code has been sent to{" "}
                  <span className="font-semibold text-amber-400">{maskedEmail || identifier}</span>.
                </p>

                {infoMessage && (
                  <div className="mb-3 flex items-center gap-2 p-2.5 rounded-xl bg-teal-950/70 border border-teal-700 text-teal-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                {otpError && (
                  <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{otpError}</span>
                  </div>
                )}

                <label className="block text-xs font-bold uppercase tracking-wider text-teal-200 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-teal-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (otpError) setOtpError(null);
                    }}
                    placeholder="123456"
                    required
                    autoFocus
                    disabled={isSubmitting}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#031211] border border-teal-800 text-white placeholder-teal-600 text-center tracking-widest text-lg font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-teal-400 hover:text-teal-200 flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change identifier
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} /> Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  3. Set New Administrative Password
                </h2>
                <p className="text-xs text-teal-300/80 mb-4">
                  Choose a high-security password. Note that consecutive series numbers (like 123 or 1234) are strictly disallowed.
                </p>

                {passwordError && (
                  <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* New Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-200">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-teal-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="Min. 8 characters (Strong)"
                      required
                      autoFocus
                      disabled={isSubmitting}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#031211] border border-teal-800 text-white placeholder-teal-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-teal-400 hover:text-teal-200"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Checklist */}
                {newPassword && (() => {
                  const val = validateStrongPassword(newPassword);
                  return (
                    <div className="mt-2 p-3 bg-[#031211] border border-teal-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-teal-300">Password Strength:</span>
                        <span className={val.score === 6 ? "text-emerald-400 font-bold" : val.score >= 4 ? "text-amber-400" : "text-rose-400 font-bold"}>
                          {val.score === 6 ? "Strong" : val.score >= 4 ? "Moderate" : "Weak"} ({val.score}/6)
                        </span>
                      </div>
                      <div className="w-full bg-teal-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${val.score === 6 ? "bg-emerald-500" : val.score >= 4 ? "bg-amber-500" : "bg-rose-500"}`}
                          style={{ width: `${(val.score / 6) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                        <div className={`flex items-center gap-1 ${val.rules.minLength ? "text-emerald-400" : "text-teal-700"}`}>
                          {val.rules.minLength ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />} 8+ Characters
                        </div>
                        <div className={`flex items-center gap-1 ${val.rules.hasUppercase ? "text-emerald-400" : "text-teal-700"}`}>
                          {val.rules.hasUppercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />} Uppercase (A-Z)
                        </div>
                        <div className={`flex items-center gap-1 ${val.rules.hasLowercase ? "text-emerald-400" : "text-teal-700"}`}>
                          {val.rules.hasLowercase ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />} Lowercase (a-z)
                        </div>
                        <div className={`flex items-center gap-1 ${val.rules.hasNumber ? "text-emerald-400" : "text-teal-700"}`}>
                          {val.rules.hasNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />} Number (0-9)
                        </div>
                        <div className={`flex items-center gap-1 ${val.rules.hasSpecial ? "text-emerald-400" : "text-teal-700"}`}>
                          {val.rules.hasSpecial ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />} Special (!@#$)
                        </div>
                        <div className={`flex items-center gap-1 ${val.rules.noSeriesNumber ? "text-emerald-400" : "text-rose-400 font-semibold"}`}>
                          {val.rules.noSeriesNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3" />} No series (123, 1234)
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Confirm Password Input */}
                <div className="space-y-1.5 mt-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-200">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-teal-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      placeholder="Re-enter new password"
                      required
                      disabled={isSubmitting}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#031211] border border-teal-800 text-white placeholder-teal-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-teal-400 hover:text-teal-200"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Password Reset Complete</h2>
              <p className="text-xs text-teal-300/80 max-w-sm mx-auto">
                Your administrator password has been updated securely. Previous sessions have been revoked.
              </p>
              <div className="pt-3">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm transition"
                >
                  Return to Admin Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/admin/login"
            className="text-xs text-teal-400 hover:text-amber-400 inline-flex items-center gap-1.5 transition font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Administrative Login
          </Link>
        </div>
      </div>
    </div>
  );
}
