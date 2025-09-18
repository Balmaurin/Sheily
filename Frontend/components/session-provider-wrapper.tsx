'use client';

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export default function SessionProviderWrapper({ 
  children, 
  initialSession 
}: { 
  children: React.ReactNode, 
  initialSession?: Session | null 
}) {
  return (
    <SessionProvider session={initialSession}>
      {children}
    </SessionProvider>
  );
}
