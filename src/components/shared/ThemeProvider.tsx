/*
 * Theme Provider component.
 *
 * Manages light/dark mode using localStorage and the "dark" class
 * on the <html> element.
 *
 * Usage: Wrap the app in <ThemeProvider> in layout.tsx.
 * The toggle button is in the DashboardNav and Settings page.
 */

"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Read the initial theme from localStorage or system preference.
 * Called once during the first render (lazy initializer).
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initializer so the theme is read only once on mount.
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme class to <html> and persist to localStorage whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
