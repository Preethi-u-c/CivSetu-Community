"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { wardsData } from "@/data/wards";
import {
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function RegisterPage() {
  // Form fields
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [address, setAddress] = useState("");

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState<string | null>(null);

  // Indian mobile validation helper: 10 digits starting with 6, 7, 8, or 9
  const isValidIndianMobile = (mobile: string) => /^[6-9]\d{9}$/.test(mobile.trim());

  // Email validation helper
  const isValidEmail = (em: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim());

  // Handler: Send OTP via Backend
  const handleSendOtp = async () => {
    if (isSendingOtp) return;
    setOtpError(null);
    const trimmedMobile = mobileNumber.trim();

    if (!trimmedMobile) {
      setErrors((prev) => ({ ...prev, mobile: "Mobile number is required." }));
      return;
    }

    if (!isValidIndianMobile(trimmedMobile)) {
      setErrors((prev) => ({
        ...prev,
        mobile: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).",
      }));
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: trimmedMobile, purpose: "registration" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors((prev) => ({ ...prev, mobile: data.error || "Failed to dispatch OTP." }));
        return;
      }

      // Clear mobile error & activate OTP step
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mobile;
        delete next.server;
        return next;
      });
      setOtpSent(true);
    } catch {
      setErrors((prev) => ({
        ...prev,
        mobile: "Network error occurred while connecting to the OTP server. Please try again.",
      }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handler: Verify OTP via Backend
  const handleVerifyOtp = async () => {
    if (isVerifyingOtp) return;
    setOtpError(null);
    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setOtpError("Please enter the OTP received on your mobile number.");
      return;
    }

    if (trimmedOtp.length < 4 || trimmedOtp.length > 6 || !/^\d+$/.test(trimmedOtp)) {
      setOtpError("Please enter a valid 4 to 6 digit numerical OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: mobileNumber.trim(),
          otp: trimmedOtp,
          purpose: "registration",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data.error || "OTP verification failed. Please try again.");
        return;
      }

      // Mark as verified
      setIsMobileVerified(true);
      setOtpError(null);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.otp;
        return next;
      });
    } catch {
      setOtpError("Network error occurred while verifying OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handler: Submit Registration Form via Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};

    // 1. Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters.";
    }

    // 2. Mobile validation
    if (!mobileNumber.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!isValidIndianMobile(mobileNumber.trim())) {
      newErrors.mobile = "Please enter a valid 10-digit Indian mobile number.";
    }

    // 3. OTP verification check
    if (!isMobileVerified) {
      newErrors.otp = "Mobile number verification via OTP is required before registration.";
    }

    // 4. Email validation
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // 5. Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    // 6. Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // 7. Ward validation
    if (!selectedWard) {
      newErrors.ward = "Please select your Ward / Locality.";
    }

    // 8. Residential Address validation
    if (!address.trim()) {
      newErrors.address = "Residential address is required.";
    } else if (address.trim().length < 8) {
      newErrors.address = "Please provide your complete residential address (door/street).";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) {
        el.focus();
      }
      return;
    }

    // Real backend registration request
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          wardNumber: selectedWard,
          residentialAddress: address.trim(),
          otp: otp.trim() || "123456",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ server: data.error || "Citizen registration failed. Please try again." });
        return;
      }

      setRegistrationComplete(true);
    } catch {
      setErrors({
        server: "Network error communicating with the registration server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Citizen Registration"
      subtitle="Create your official citizen account for Lakshmeshwar municipal services, ward inquiries, and online grievance tracking"
      breadcrumbs={[{ label: "Citizen Registration" }]}
    >
      <div className="max-w-2xl mx-auto py-2 sm:py-4">
        {/* Header Notice Banner */}
        <div className="mb-6 p-4 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#064E4A] dark:text-teal-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-[#064E4A] dark:text-teal-200">
            <p className="font-bold">Official Civic Registration Portal</p>
            <p className="text-gray-600 dark:text-gray-300 mt-0.5">
              Registration allows residents of Lakshmeshwar TMC to file complaints, track official applications, and access ward-specific municipal programs.
            </p>
          </div>
        </div>

        {registrationComplete ? (
          /* Registration Success State */
          <div className="bg-white dark:bg-[#071d1b] border border-teal-300 dark:border-teal-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/60 rounded-full flex items-center justify-center mx-auto text-[#064E4A] dark:text-teal-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Registration Profile Validated
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-[#064E4A] dark:text-teal-300">{fullName}</span>.
                Your citizen account details for Ward {selectedWard} have passed client validation.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-left text-xs sm:text-sm space-y-1.5 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Registered Name:</span>
                <span className="font-semibold">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Verified Mobile:</span>
                <span className="font-semibold">+91 {mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="font-semibold">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Jurisdiction Ward:</span>
                <span className="font-semibold">Ward No. {selectedWard}</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white px-8 py-3 rounded-lg font-bold shadow transition hover:shadow-md text-sm"
              >
                <span>Proceed to Citizen Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Global Error Banners */}
            {errors.server && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Registration Error</span>
                  <p className="mt-0.5">{errors.server}</p>
                  {(errors.server.toLowerCase().includes("already registered") ||
                    errors.server.toLowerCase().includes("login")) && (
                    <div className="mt-2">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 font-bold text-[#064E4A] dark:text-teal-300 hover:underline text-xs bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <span>Proceed to Citizen Login</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {Object.keys(errors).filter((k) => k !== "server").length > 0 && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Please complete all required fields correctly:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                    {Object.entries(errors)
                      .filter(([k]) => k !== "server")
                      .map(([_, err], i) => (
                        <li key={i}>{err}</li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 1. Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.fullName;
                        return n;
                      });
                    }
                  }}
                  placeholder="Enter your full name as per Aadhaar / Official ID"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-gray-800/80 dark:border-gray-700 focus:outline-none text-sm transition ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* 2. Mobile Number & Send OTP */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      id="mobileNumber"
                      type="tel"
                      maxLength={10}
                      disabled={isMobileVerified}
                      value={mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setMobileNumber(val);
                        if (isMobileVerified) {
                          setIsMobileVerified(false);
                          setOtpSent(false);
                          setOtp("");
                        }
                        if (errors.mobile) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.mobile;
                            return n;
                          });
                        }
                      }}
                      placeholder="10-digit mobile number"
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-r-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                        isMobileVerified
                          ? "bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed border-gray-300 dark:border-gray-700"
                          : errors.mobile
                          ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                      }`}
                      aria-invalid={!!errors.mobile}
                      aria-describedby={errors.mobile ? "mobile-error" : undefined}
                    />
                  </div>
                </div>

                {!isMobileVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="px-4 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap shadow-sm disabled:opacity-50"
                  >
                    {isSendingOtp ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                )}
              </div>

              {errors.mobile && (
                <p id="mobile-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.mobile}
                </p>
              )}

              {/* Verified Badge */}
              {isMobileVerified && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mobile number verified</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileVerified(false);
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-xs text-gray-500 hover:text-[#064E4A] dark:hover:text-teal-300 underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* 3. OTP Section (Active when OTP is sent & not yet verified) */}
            {otpSent && !isMobileVerified && (
              <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="otp"
                    className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Enter OTP <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                    OTP sent to +91 {mobileNumber}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      setOtpError(null);
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:outline-none focus:border-[#064E4A] dark:focus:border-teal-400 text-sm font-mono tracking-widest text-center sm:text-left"
                    aria-describedby={otpError ? "otp-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="px-5 py-2.5 bg-[#B98519] hover:bg-[#9E7013] text-white text-xs sm:text-sm font-bold rounded-lg transition shadow-sm disabled:opacity-50"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>

                {otpError && (
                  <p id="otp-error" className="text-xs text-red-600 dark:text-red-400">
                    {otpError}
                  </p>
                )}

                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Tip: For testing this frontend preview, enter any 6 digits (e.g. 123456) and click Verify OTP.
                </p>
              </div>
            )}

            {errors.otp && !isMobileVerified && (
              <p className="text-xs text-red-600 dark:text-red-400 -mt-2">
                {errors.otp}
              </p>
            )}

            {/* 4. Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.email;
                        return n;
                      });
                    }
                  }}
                  placeholder="citizen@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* 5 & 6. Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.password;
                          return n;
                        });
                      }
                    }}
                    placeholder="Min. 8 characters"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                    }`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.confirmPassword;
                          return n;
                        });
                      }
                    }}
                    placeholder="Re-enter password"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                    }`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
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
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* 7. Ward / Locality Dropdown using wardsData */}
            <div>
              <label
                htmlFor="ward"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Ward / Locality <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <select
                  id="ward"
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(e.target.value);
                    if (errors.ward) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.ward;
                        return n;
                      });
                    }
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-gray-800/80 dark:border-gray-700 focus:outline-none text-sm transition bg-white dark:text-gray-200 ${
                    errors.ward
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!errors.ward}
                  aria-describedby={errors.ward ? "ward-error" : undefined}
                >
                  <option value="">-- Select Your Lakshmeshwar Ward --</option>
                  {wardsData.map((w) => (
                    <option
                      key={w.wardNumber}
                      value={`Ward ${String(w.wardNumber).padStart(2, "0")}`}
                    >
                      Ward {w.wardNumber} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.ward && (
                <p id="ward-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.ward}
                </p>
              )}
            </div>

            {/* 8. Residential Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                Residential Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.address;
                        return n;
                      });
                    }
                  }}
                  placeholder="House/Door No, Street Name, Cross, Landmark, Lakshmeshwar - 582116"
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                    errors.address
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                  }`}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? "address-error" : undefined}
                />
              </div>
              {errors.address && (
                <p id="address-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            {/* 9. Register Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-3 rounded-lg transition shadow hover:shadow-md text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating Registration...</span>
                  </>
                ) : (
                  <span>Register Citizen Account</span>
                )}
              </button>
            </div>

            {/* Bottom Link: Already have an account? Login */}
            <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#064E4A] dark:text-teal-400 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </PageContainer>
  );
}
