"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Building,
  PhoneCall,
  Clock,
  BellRing,
  ShieldAlert,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Info,
  Check,
  X,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { validateStrongPassword } from "@/lib/security/validator";

interface SettingItem {
  value: string;
  description: string;
  category: string;
  updatedAt: string;
}

type SettingsDictionary = Record<string, SettingItem>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsDictionary>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Administrator password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error(`Failed to load settings (status: ${res.status})`);
      }
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        const initialForm: Record<string, string> = {};
        for (const [key, item] of Object.entries(data.data as SettingsDictionary)) {
          initialForm[key] = item.value;
        }
        setFormData(initialForm);
      } else {
        throw new Error(data.error || "Unable to read settings");
      }
    } catch (err: unknown) {
      console.error("Settings load error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: formData }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccessMessage("Administrative settings successfully saved and applied.");
      // Refresh to update timestamps
      await fetchSettings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError("Current administrator password is required.");
      return;
    }

    if (!newPassword) {
      setPassError("New administrator password is required.");
      return;
    }

    const val = validateStrongPassword(newPassword);
    if (!val.isValid) {
      setPassError(val.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    setPassSaving(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update administrator password.");
      }

      setPassSuccess("Administrator security password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : "Error changing password.");
    } finally {
      setPassSaving(false);
    }
  };

  const categories = [
    { id: "ALL", label: "All Settings", icon: Settings },
    { id: "SECURITY", label: "Security & Passwords", icon: Lock },
    { id: "MUNICIPALITY", label: "Municipality Profile", icon: Building },
    { id: "HELPLINE", label: "Emergency & Helplines", icon: PhoneCall },
    { id: "SLA", label: "Service Level Agreements", icon: Clock },
    { id: "NOTIFICATIONS", label: "Alerts & Notifications", icon: BellRing },
    { id: "SYSTEM", label: "System Maintenance & Safety", icon: ShieldAlert },
  ];

  const filteredKeys = Object.keys(settings).filter((key) => {
    if (activeTab === "ALL") return true;
    return settings[key]?.category?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Municipal System Configuration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage institutional metadata, citizen helpline routing, grievance SLAs, and system maintenance for Lakshmeshwar TMC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading || saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-teal-800 hover:bg-gray-100 dark:hover:bg-teal-900/40 text-gray-700 dark:text-teal-200 transition"
            aria-label="Refresh settings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Security & Isolation Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs">
        <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Zero Secret Exposure & Hardened Sanitization</p>
          <p className="text-teal-700 dark:text-teal-300">
            Internal environment variables (DATABASE_URL, AUTH_SECRET, password hashes, and SMS tokens) are strictly filtered and never accessible through this administrative interface.
          </p>
        </div>
      </div>

      {/* Feedback Banners */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                  : "bg-white dark:bg-[#062422] text-gray-700 dark:text-teal-200 hover:bg-gray-100 dark:hover:bg-teal-900/50 border border-gray-200 dark:border-teal-900/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave}>
        <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-teal-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-teal-200">
                {categories.find((c) => c.id === activeTab)?.label || "Settings"}
              </span>
              <span className="text-xs text-gray-400">({filteredKeys.length} parameters)</span>
            </div>

            <button
              type="submit"
              disabled={loading || saving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition shadow-md shadow-teal-900/20"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-amber-400" />
              <p className="text-sm text-gray-500 dark:text-teal-300 font-medium">
                Loading configuration parameters...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredKeys.length === 0 && (
            <div className="p-12 text-center space-y-2">
              <Info className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                No Parameters Found
              </p>
              <p className="text-xs text-gray-500">
                No configurable keys registered under category &apos;{activeTab}&apos;.
              </p>
            </div>
          )}

          {/* Settings Grid */}
          {!loading && filteredKeys.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-teal-900/40">
              {filteredKeys.map((key) => {
                const item = settings[key];
                const value = formData[key] ?? "";
                const isBoolean = value === "true" || value === "false";

                return (
                  <div
                    key={key}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-teal-950/20 transition"
                  >
                    {/* Left: Metadata */}
                    <div className="md:w-1/2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                          {key}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-teal-900/60 text-gray-600 dark:text-teal-300 font-medium border border-gray-200 dark:border-teal-800">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-300">
                        {item.description || "System configuration variable"}
                      </p>
                    </div>

                    {/* Right: Input Control */}
                    <div className="md:w-1/2 flex items-center justify-start md:justify-end">
                      {isBoolean ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleChange(key, value === "true" ? "false" : "true")}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              value === "true" ? "bg-teal-600" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                            aria-label={`Toggle ${key}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                value === "true" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-bold ${
                              value === "true"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-500"
                            }`}
                          >
                            {value === "true" ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                      ) : key.includes("ADDRESS") || key.includes("DESCRIPTION") ? (
                        <textarea
                          rows={2}
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="w-full max-w-md px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      ) : (
                        <input
                          type={key.includes("SLA") || key.includes("WINDOW") ? "number" : "text"}
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="w-full max-w-md px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Save Button */}
          {!loading && filteredKeys.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-teal-950/40 border-t border-gray-200 dark:border-teal-900/60 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                All changes take effect immediately across citizen & authority endpoints.
              </span>
              <button
                type="submit"
                disabled={loading || saving}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition shadow-md shadow-teal-900/20"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Administrator Security & Password Management Section */}
      <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-teal-900/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <KeyRound className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Administrator Security Credentials
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active root administrator: <span className="font-mono text-teal-600 dark:text-teal-300 font-semibold">civsetu73@gmail.com</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Strong Complexity Policy Active
          </span>
        </div>

        {passSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-teal-200 uppercase tracking-wider mb-1.5">
              Current Administrator Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current administrative password"
                required
                className="w-full px-3 py-2 pr-10 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-teal-200 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-3 py-2 pr-10 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-teal-200 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {newPassword && (() => {
            const val = validateStrongPassword(newPassword);
            return (
              <div className="p-3 bg-gray-50 dark:bg-[#031514] border border-gray-200 dark:border-teal-900 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-700 dark:text-teal-300">Password Strength:</span>
                  <span className={val.score === 6 ? "text-emerald-600 dark:text-emerald-400" : val.score >= 4 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}>
                    {val.score === 6 ? "Strong" : val.score >= 4 ? "Medium" : "Weak"} ({val.score}/6)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-teal-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${val.score === 6 ? "bg-emerald-500" : val.score >= 4 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${(val.score / 6) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                  <div className={`flex items-center gap-1 ${val.rules.minLength ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-teal-700"}`}>
                    {val.rules.minLength ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />} 8+ Characters
                  </div>
                  <div className={`flex items-center gap-1 ${val.rules.hasUppercase ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-teal-700"}`}>
                    {val.rules.hasUppercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />} Uppercase (A-Z)
                  </div>
                  <div className={`flex items-center gap-1 ${val.rules.hasLowercase ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-teal-700"}`}>
                    {val.rules.hasLowercase ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />} Lowercase (a-z)
                  </div>
                  <div className={`flex items-center gap-1 ${val.rules.hasNumber ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-teal-700"}`}>
                    {val.rules.hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />} Number (0-9)
                  </div>
                  <div className={`flex items-center gap-1 ${val.rules.hasSpecial ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-teal-700"}`}>
                    {val.rules.hasSpecial ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />} Special character
                  </div>
                  <div className={`flex items-center gap-1 ${val.rules.noSeriesNumber ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400 font-semibold"}`}>
                    {val.rules.noSeriesNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3" />} No series numbers (123, 1234)
                  </div>
                </div>
              </div>
            );
          })()}

          <button
            type="submit"
            disabled={passSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition shadow-md shadow-teal-900/20"
          >
            {passSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{passSaving ? "Updating Password..." : "Update Administrator Password"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
