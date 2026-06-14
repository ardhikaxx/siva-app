"use client";

import { createContext, useContext } from "react";

const ThemeContext = createContext({});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark mode is intentionally disabled to keep SIVA in light mode only.
  return <ThemeContext.Provider value={{}}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
