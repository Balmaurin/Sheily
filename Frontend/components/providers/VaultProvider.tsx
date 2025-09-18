"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { VaultEvent, VaultState } from "./types";

const VAULT_KEY = "sheily.vault.v1";

const VaultCtx = createContext<{ 
  vault: VaultState; 
  award: (ev: VaultEvent) => void; 
  reset: () => void 
} | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [vault, setVault] = useState<VaultState>({ 
    tokens: 0, 
    history: [] 
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VAULT_KEY);
      if (raw) {
        const parsedVault = JSON.parse(raw);
        setVault(parsedVault);
      }
    } catch (error) {
      console.error("Error loading vault state", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
    } catch (error) {
      console.error("Error saving vault state", error);
    }
  }, [vault]);

  const award = (ev: VaultEvent) => {
    setVault(v => ({
      tokens: v.tokens + ev.tokens,
      history: [ev, ...v.history].slice(0, 250)
    }));
  };

  const reset = () => {
    setVault({ tokens: 0, history: [] });
  };

  const value = useMemo(() => ({ vault, award, reset }), [vault]);

  return (
    <VaultCtx.Provider value={value}>
      {children}
    </VaultCtx.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultCtx);
  if (!ctx) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return ctx;
}
