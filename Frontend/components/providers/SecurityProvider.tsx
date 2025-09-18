"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SecurityState } from "./types";

const SECURITY_KEY = "sheily.security.v1";

const SecurityCtx = createContext<{ 
  security: SecurityState; 
  setBlock: (b: boolean) => void; 
  setIssues: (n: number) => void 
} | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [security, setSecurity] = useState<SecurityState>({ 
    blockOnIssues: false, 
    lastIssues: 0 
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SECURITY_KEY);
      if (raw) {
        const parsedSecurity = JSON.parse(raw);
        setSecurity(parsedSecurity);
      }
    } catch (error) {
      console.error("Error loading security state", error);
    }
  }, []);

  const setBlock = (b: boolean) => {
    const newState = { ...security, blockOnIssues: b };
    try {
      setSecurity(newState);
      window.localStorage.setItem(SECURITY_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Error saving security state", error);
    }
  };

  const setIssues = (n: number) => {
    const newState = { ...security, lastIssues: n };
    try {
      setSecurity(newState);
      window.localStorage.setItem(SECURITY_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Error saving security state", error);
    }
  };

  return (
    <SecurityCtx.Provider value={{ security, setBlock, setIssues }}>
      {children}
    </SecurityCtx.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityCtx);
  if (!ctx) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return ctx;
}
