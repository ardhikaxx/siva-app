"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CycleProvider } from "@/context/CycleContext";
import { AlertProvider } from "@/context/AlertContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CycleProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </CycleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
