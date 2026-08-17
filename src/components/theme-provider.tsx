import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const themes = [
  { id: "quantum", label: "Quantum Nebula", swatch: ["#7c5cff", "#e050a0", "#ff8a3d"] },
  { id: "ember", label: "Ember Flare", swatch: ["#ff9040", "#ff5a45", "#ffc06b"] },
  { id: "aurora", label: "Aurora Ice", swatch: ["#3fd6d2", "#4ade9a", "#4aa8ff"] },
  { id: "void", label: "Deep Void", swatch: ["#ff3fa0", "#b23bff", "#111111"] },
  { id: "slate", label: "Slate Console", swatch: ["#5b8def", "#59b6e0", "#94a3b8"] },
  { id: "matrix", label: "Terminal Green", swatch: ["#41ff8f", "#7dff5a", "#0b1a12"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

const STORAGE_KEY = "quantum-theme";

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}>({ theme: "quantum", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("quantum");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && themes.some((t) => t.id === stored)) setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
