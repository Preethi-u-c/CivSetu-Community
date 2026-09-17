"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  User,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & Errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  // Helper validation
  const isValidMobile = (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\s+/g, ""));
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // Step 1: Send OTP via Backend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setIdentifierError("Mobile number or email address is required.");
      return;
    }

    if (!isValidMobile(trimmed) && !isValidEmail(trimmed)) {
      setIdentifierError("Please enter a valid 10-digit Indian mobile number or email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setIdentifierError(data.error || "Failed to initiate password reset.");
        return;
      }

      setStep(2);
    } catch {
      setIdentifierError("Network error occurred while connecting to the recovery service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP via Backend
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setOtpError("OTP is required to verify your identity.");
      return;
    }

    if (trimmedOtp.length < 4 || trimmedOtp.length > 6 || !/^\d+$/.test(trimmedOtp)) {
      setOtpError("Please enter a valid numerical OTP (4 to 6 digits).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: trimmedOtp,
          purpose: "password_reset",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data.error || "OTP verification failed. Please try again.");
        return;
      }

      setStep(3);
    } catch {
      setOtpError("Network error occurred while verifying OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password via Backend
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { newPassword?: string; confirmNewPassword?: string } = {};

    if (!newPassword) {
      errs.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errs.newPassword = "New password must be at least 8 characters.";
    }

    if (!confirmNewPassword) {
      errs.confirmNewPassword = "Confirm password is required.";
    } else if (confirmNewPassword !== newPassword) {
      errs.confirmNewPassword = "Passwords do not match.";
    }

    setPasswordErrors(errs);

    if (Object.keys(errs).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
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
        setPasswordErrors({ newPassword: data.error || "Password reset failed." });
        return;
      }

      setStep(4);
    } catch {
      setPasswordErrors({
        newPassword: "Network error occurred while communicating with the reset service.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Citizen Password Recovery"
      subtitle="Reset your CivSetu citizen credentials securely using registered mobile or email verification"
      breadcrumbs={[
        { label: "Login", href: "/login" },
        { label: "Forgot Password" },
      ]}
    >
      <div className="max-w-md mx-auto py-2 sm:py-4">
        {/* Step Progress Indicators */}
        {step < 4 && (
          <div className="mb-6 flex items-center justify-between text-xs font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-3">
            <span className={step >= 1 ? "text-[#064E4A] dark:text-teal-400" : ""}>
              1. Identity
            </span>
            <span>→</span>
            <span className={step >= 2 ? "text-[#064E4A] dark:text-teal-400" : ""}>
              2. Verify OTP
            </span>
            <span>→</span>
            <span className={step >= 3 ? "text-[#064E4A] dark:text-teal-400" : ""}>
              3. New Password
            </span>
          </div>
        )}

        {/* STEP 1: Mobile Number or Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate className="space-y-4">
            <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl text-xs text-teal-900 dark:text-teal-200">
              <p className="font-bold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>Account Identification</span>
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Enter the mobile number or email address linked to your Lakshmeshwar TMC citizen profile.
              </p>
            </div>

            <div>
              <label
                htmlFor="forgot-identifier"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Mobile Number or Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="forgot-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (identifierError) setIdentifierError(null);
                  }}
                  placeholder="10-digit mobile or registered email"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                    identifierError
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!identifierError}
                  aria-describedby={identifierError ? "identifier-error" : undefined}
                />
              </div>
              {identifierError && (
                <p id="identifier-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {identifierError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-3 rounded-lg transition shadow hover:shadow-md text-sm flex items-center justify-center gap-2"
            >
              <span>Send OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl text-xs text-teal-900 dark:text-teal-200">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>Verification Code Sent</span>
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                A verification code has been dispatched to{" "}
                <span className="font-bold text-gray-800 dark:text-gray-100">{identifier}</span>.
              </p>
            </div>

            <div>
              <label
                htmlFor="forgot-otp"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                OTP <span className="text-red-500">*</span>
              </label>
              <input
                id="forgot-otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (otpError) setOtpError(null);
                }}
                placeholder="Enter 6-digit OTP"
                className={`w-full px-3 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm font-mono tracking-widest text-center transition ${
                  otpError
                    ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                }`}
                aria-invalid={!!otpError}
                aria-describedby={otpError ? "otp-error" : undefined}
                autoFocus
              />
              {otpError && (
                <p id="otp-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {otpError}
                </p>
              )}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Tip: For testing this frontend preview, type any 6 digits (e.g. 123456) and click Verify OTP.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#B98519] hover:bg-[#9E7013] text-white font-bold py-2.5 rounded-lg transition shadow hover:shadow-md text-sm flex items-center justify-center gap-2"
              >
                <span>Verify OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: New Password & Confirm */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl text-xs text-teal-900 dark:text-teal-200">
              <p className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>Set New Password</span>
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Choose a strong password containing at least 8 characters.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword) {
                      setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-9 pr-10 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                    passwordErrors.newPassword
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!passwordErrors.newPassword}
                  aria-describedby={passwordErrors.newPassword ? "newPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p id="newPassword-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (passwordErrors.confirmNewPassword) {
                      setPasswordErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
                    }
                  }}
                  placeholder="Re-enter new password"
                  className={`w-full pl-9 pr-10 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                    passwordErrors.confirmNewPassword
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!passwordErrors.confirmNewPassword}
                  aria-describedby={passwordErrors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmNewPassword && (
                <p id="confirmNewPassword-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {passwordErrors.confirmNewPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-3 rounded-lg transition shadow hover:shadow-md text-sm flex items-center justify-center gap-2"
            >
              <span>Reset Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 4: Success State */}
        {step === 4 && (
          <div className="bg-white dark:bg-[#071d1b] border border-teal-300 dark:border-teal-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/60 rounded-full flex items-center justify-center mx-auto text-[#064E4A] dark:text-teal-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Password Reset Successfully
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                Your password update has been validated. You can now use your updated credentials to log into your citizen account.
              </p>
            </div>

            <div className="pt-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white px-8 py-3 rounded-lg font-bold shadow transition hover:shadow-md text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom: Back to Login Link */}
        {step < 4 && (
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800 mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-bold text-[#064E4A] dark:text-teal-400 hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
