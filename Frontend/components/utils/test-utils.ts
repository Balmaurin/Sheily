"use client";

import type { Sample, VaultEvent, UserState, SecurityState, SFTSample } from "../providers/types";

export function createSampleSFT(overrides: Partial<SFTSample> = {}): SFTSample {
  return {
    id: `sft-${Math.random().toString(36).slice(2)}`,
    type: "sft",
    instruction: "Escribe un resumen de un artículo científico",
    input: "Artículo sobre inteligencia artificial",
    output: "El artículo discute los avances recientes en IA generativa...",
    tags: ["resumen", "ciencia"],
    lang: "es",
    meta: {
      score: 8,
      tokens: 4,
      pass: true,
      notes: ["Resumen claro y conciso"]
    },
    ...overrides
  };
}

export function createVaultEvent(overrides: Partial<VaultEvent> = {}): VaultEvent {
  return {
    id: `event-${Math.random().toString(36).slice(2)}`,
    type: "sft",
    score: 8,
    tokens: 4,
    ts: new Date().toISOString(),
    ...overrides
  };
}

export function createUserState(overrides: Partial<UserState> = {}): UserState {
  return {
    email: "usuario@ejemplo.com",
    password: "contraseña_segura",
    walletPhantom: "phantom_wallet_address",
    ...overrides
  };
}

export function createSecurityState(overrides: Partial<SecurityState> = {}): SecurityState {
  return {
    blockOnIssues: false,
    lastIssues: 0,
    ...overrides
  };
}
