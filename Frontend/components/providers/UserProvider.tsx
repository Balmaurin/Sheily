"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { UserState } from "./types";

const USER_KEY = "sheily.user.v1";

const UserCtx = createContext<{ 
  user: UserState; 
  save: (u: UserState) => void 
} | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>({ 
    email: "", 
    password: "", 
    walletPhantom: "" 
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        const parsedUser = JSON.parse(raw);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user state", error);
    }
  }, []);

  const save = (u: UserState) => {
    try {
      setUser(u);
      window.localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch (error) {
      console.error("Error saving user state", error);
    }
  };

  return (
    <UserCtx.Provider value={{ user, save }}>
      {children}
    </UserCtx.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
