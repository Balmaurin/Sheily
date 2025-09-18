"use client";

export type ScoreMeta = { score: number; tokens: number; pass: boolean; notes: string[] };

export type SFTSample = {
  id: string;
  type: "sft";
  instruction: string;
  input?: string;
  output: string;
  tags?: string[];
  lang?: string;
  meta?: ScoreMeta;
};

export type PairwiseSample = {
  id: string;
  type: "pairwise";
  prompt: string;
  chosen: string;
  rejected: string;
  rationale?: string;
  tags?: string[];
  meta?: ScoreMeta;
};

export type DialogTurn = { role: "user" | "assistant" | "system"; content: string };

export type DialogSample = {
  id: string;
  type: "dialog";
  turns: DialogTurn[];
  tags?: string[];
  meta?: ScoreMeta;
};

export type ClassifySample = {
  id: string;
  type: "classify";
  text: string;
  labels: string[];
  multi?: boolean;
  tags?: string[];
  meta?: ScoreMeta;
};

export type TestSample = {
  id: string;
  type: "test";
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  tags?: string[];
  meta?: ScoreMeta;
};

export type YesNoSample = {
  id: string;
  type: "yesno";
  text: string;
  answer: "si" | "no";
  explanation?: string;
  tags?: string[];
  meta?: ScoreMeta;
};

export type TrueFalseSample = {
  id: string;
  type: "truefalse";
  statement: string;
  answer: boolean;
  explanation?: string;
  tags?: string[];
  meta?: ScoreMeta;
};

export type Sample =
  | SFTSample
  | PairwiseSample
  | DialogSample
  | ClassifySample
  | TestSample
  | YesNoSample
  | TrueFalseSample;

export type DatasetState = { samples: Sample[]; createdAt: string; updatedAt: string };
export type VaultEvent = { id: string; type: Sample["type"]; score: number; tokens: number; ts: string };
export type VaultState = { tokens: number; history: VaultEvent[] };
export type UserState = { email: string; password: string; walletPhantom: string };
export type SecurityState = { blockOnIssues: boolean; lastIssues: number };
