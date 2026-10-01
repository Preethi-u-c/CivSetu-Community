"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const hasUserTyped = useRef(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Validation & UI State
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<string | null>(null);

  // Capture safe internal redirect parameter from query string on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  // Comprehensive form cleanup: resets React state, DOM form elements, and local storage
  const resetLoginForm = useCallback(() => {
    hasUserTyped.current = false;
    setIdentifier("");
    setPassword("");
    setErrors({});
    setFormError(null);
    setSubmittedInfo(null);

    if (formRef.current) {
      formRef.current.reset();
    }

    const idInput = document.getElementById("identifier") as HTMLInputElement | null;
    if (idInput) {
      idInput.value = "";
    }
    const passInput = document.getElementById("password") as HTMLInputElement | null;
    if (passInput) {
      passInput.value = "";
    }

    try {
      localStorage.removeItem("civsetu_remember_identifier");
      sessionStorage.removeItem("civsetu_remember_identifier");
    } catch {
      // Storage unavailable
    }
  }, []);

  // Ensure clean form state without residual stored credentials on mount, navigation, or visibility
  useEffect(() => {
    // 1. Initial reset on mount
    resetLoginForm();

    // 2. Next-frame reset to override any browser autofill that runs immediately after DOM mount
    const rafId = requestAnimationFrame(() => {
      if (!hasUserTyped.current) {
        resetLoginForm();
      }
    });

    // 3. Handle browser back-forward cache (bfcache) restoration
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        resetLoginForm();
        requestAnimationFrame(resetLoginForm);
      }
    };

    // 4. Handle visibility change when tab/window becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const idInput = document.getElementById("identifier") as HTMLInputElement | null;
        const passInput = document.getElementById("password") as HTMLInputElement | null;
        if (!hasUserTyped.current && idInput && idInput.value) {
          idInput.value = "";
        }
        if (!hasUserTyped.current && passInput && passInput.value) {
          passInput.value = "";
        }
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resetLoginForm]);

  // Validation helpers
  const isValidMobile = (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\s+/g, ""));
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    const newErrors: { identifier?: string; password?: string } = {};

    const trimmedIdentifier = identifier.trim();

    // 1. Validate Mobile Number or Email
    if (!trimmedIdentifier) {
      newErrors.identifier = "Please enter your registered mobile number or email address.";
    } else {
      const isMobile = isValidMobile(trimmedIdentifier);
      const isEmail = isValidEmail(trimmedIdentifier);

      if (!isMobile && !isEmail) {
        newErrors.identifier =
          "Please enter a valid 10-digit Indian mobile number or a valid email address.";
      }
    }

    // 2. Validate Password
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmittedInfo(null);
      return;
    }

    setIsSubmitting(true);
    setSubmittedInfo(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmedIdentifier, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || "Authentication failed. Please verify credentials.");
        return;
      }

      setSubmittedInfo("Authentication successful! Welcome to CivSetu citizen services.");
      resetLoginForm();
      // Navigate to intended redirect destination or Citizen Portal Dashboard
      const destination = redirectPath || "/dashboard";
      window.location.href = destination;
    } catch {
      setFormError("Network error communicating with authentication server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Citizen Login"
      subtitle="Sign in to your CivSetu account to track grievances, view municipal applications, and manage civic services"
      breadcrumbs={[{ label: "Citizen Login" }]}
    >
      <div className="max-w-md mx-auto py-2 sm:py-4">
        {/* Portal Information Badge */}
        <div className="mb-6 p-3.5 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#064E4A] dark:bg-teal-900/60 flex items-center justify-center flex-shrink-0 text-white dark:text-teal-300">
            <User className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#064E4A] dark:text-teal-200">
            <p className="font-bold">Citizen Services Gateway</p>
            <p className="text-gray-600 dark:text-gray-400">
              Lakshmeshwar Town Municipal Council Citizen Portal
            </p>
          </div>
        </div>

        {/* Informational Verification Message when submitted */}
        {submittedInfo && (
          <div
            role="status"
            className="mb-5 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-800 text-xs sm:text-sm text-teal-800 dark:text-teal-200 flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Client Validation Successful</p>
              <p className="mt-0.5 text-gray-700 dark:text-gray-300">{submittedInfo}</p>
            </div>
          </div>
        )}

        {/* Server Error Alert Banner */}
        {formError && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Login Failed</p>
              <p className="mt-0.5">{formError}</p>
            </div>
          </div>
        )}

        {/* Citizen Login Form */}
        <form
          ref={formRef}
          onSubmit={handleLoginSubmit}
          noValidate
          autoComplete="off"
          className="space-y-4"
        >
          {/* 1. Mobile Number or Email */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
            >
              Mobile Number or Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                id="identifier"
                name="username"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => {
                  hasUserTyped.current = true;
                  setIdentifier(e.target.value);
                  if (errors.identifier) {
                    setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }
                  if (submittedInfo) setSubmittedInfo(null);
                }}
                placeholder="10-digit mobile number OR email address"
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                  errors.identifier
                    ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                }`}
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? "identifier-error" : undefined}
                required
              />
            </div>
            {errors.identifier && (
              <p id="identifier-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* 2. Password */}
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
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  hasUserTyped.current = true;
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                  if (submittedInfo) setSubmittedInfo(null);
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 border rounded-lg dark:bg-gray-800/80 focus:outline-none text-sm transition ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 ring-1 ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-[#064E4A] dark:focus:border-teal-400"
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
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
            {errors.password && (
              <p id="password-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.password}
              </p>
            )}

            {/* 3. Forgot Password? Link DIRECTLY BELOW Password input, aligned right */}
            <div className="flex justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#064E4A] dark:text-teal-400 hover:underline hover:text-[#0B6B63] transition"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* 4. Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold py-3 rounded-lg transition shadow hover:shadow-md text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Bottom: Don't have an account? Register */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : "/register"}
                className="font-bold text-[#064E4A] dark:text-teal-400 hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </form>

        {/* Municipal Staff / Official Access Notice */}
        <div className="mt-8 p-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-400 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
            <Shield className="w-4 h-4 text-[#B98519]" />
            <span>Are you a Municipal Officer or TMC Staff?</span>
          </div>
          <p className="text-[11px]">
            Municipal employees and ward administrators can access the internal management desk.
          </p>
          <Link
            href="/admin"
            className="inline-block mt-1 font-bold text-[#064E4A] dark:text-teal-300 underline hover:text-[#0B6B63]"
          >
            Access Officer Administrative Desk →
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
