import { useEffect, useState } from "react";
import { useHydrated } from "./useHydrated.js";
const THEME_KEY = "pokedex-go-theme";
function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  } catch {
    /* The selected theme still works in memory if storage is blocked. */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
export function useTheme() {
  const hydrated = useHydrated();
  const [theme, setTheme] = useState(getInitialTheme);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* Keep the theme usable. */
    }
  }, [theme]);
  return {
    theme: hydrated ? theme : "light",
    toggleTheme: () =>
      setTheme((current) => (current === "light" ? "dark" : "light")),
  };
}
