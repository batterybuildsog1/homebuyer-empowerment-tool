
import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "finance-theme",
}: ThemeProviderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeProviderContext.Provider value={{ theme: theme || defaultTheme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useThemeProvider() {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useThemeProvider must be used within a ThemeProvider");
  
  return context;
}
