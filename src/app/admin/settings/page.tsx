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
} from "lucide-react";

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

  const categories = [
    { id: "ALL", label: "All Settings", icon: Settings },
    { id: "MUNICIPALITY", label: "Municipality Profile", icon: Building },
    { id: "HELPLINE", label: "Emergency & Helplines", icon: PhoneCall },
    { id: "SLA", label: "Service Level Agreements", icon: Clock },
    { id: "NOTIFICATIONS", label: "Alerts & Notifications", icon: BellRing },
    { id: "SYSTEM", label: "System Maintenance & Safety", icon: ShieldAlert },
  ];

  const filteredKeys = Object.keys(settings).filter((key) => {
    if (activeTab === "ALL") return true;
    return settings[key]?.category === activeTab;
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
    </div>
  );
}
