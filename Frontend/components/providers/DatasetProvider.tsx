"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { DatasetState, Sample } from "./types";

const DATASET_KEY = "sheily.dataset.v1";

type DatasetAction = 
  | { type: "ADD"; sample: Sample }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: DatasetState };

function reducer(state: DatasetState, action: DatasetAction): DatasetState {
  switch (action.type) {
    case "ADD":
      return { 
        ...state, 
        samples: [action.sample, ...state.samples], 
        updatedAt: new Date().toISOString() 
      };
    case "REMOVE":
      return { 
        ...state, 
        samples: state.samples.filter(s => s.id !== action.id), 
        updatedAt: new Date().toISOString() 
      };
    case "CLEAR":
      return { 
        ...state, 
        samples: [], 
        updatedAt: new Date().toISOString() 
      };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

const DatasetCtx = createContext<{ 
  state: DatasetState; 
  dispatch: React.Dispatch<DatasetAction> 
} | null>(null);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { 
    samples: [], 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DATASET_KEY);
      if (raw) {
        const parsedState = JSON.parse(raw);
        dispatch({ type: "HYDRATE", state: parsedState });
      }
    } catch (error) {
      console.error("Error loading dataset state", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DATASET_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving dataset state", error);
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DatasetCtx.Provider value={value}>
      {children}
    </DatasetCtx.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetCtx);
  if (!ctx) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return ctx;
}
