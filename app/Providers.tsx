"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CycleProvider } from "@/context/CycleContext";
import { AlertProvider } from "@/context/AlertContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CycleProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </CycleProvider>
    </AuthProvider>
  );
}
