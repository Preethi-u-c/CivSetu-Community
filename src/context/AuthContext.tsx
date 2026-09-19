"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CitizenUser {
  id: string;
  fullName: string;
  mobileNumber: string;
  mobileVerified: boolean;
  email: string;
  wardNumber: string;
  residentialAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  citizen: CitizenUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshCitizen: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  citizen: null,
  loading: true,
  isAuthenticated: false,
  refreshCitizen: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [citizen, setCitizen] = useState<CitizenUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCitizen = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.citizen) {
          setCitizen(data.citizen);
        } else {
          setCitizen(null);
        }
      } else {
        setCitizen(null);
      }
    } catch {
      setCitizen(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCitizen();
  }, [refreshCitizen]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setCitizen(null);
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        citizen,
        loading,
        isAuthenticated: !!citizen,
        refreshCitizen,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
