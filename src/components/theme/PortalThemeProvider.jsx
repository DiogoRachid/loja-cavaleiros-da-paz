import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "lodge-theme";
const PUBLIC_PAGES = new Set(["Home", "Portais", "ScanRetirada", "ScanDevolucao", "BibLogin", "IrmaoLogin", "AdminLogin", "AcervoPublico"]);
export const usePortalTheme = () => useContext(ThemeContext);

export default function PortalThemeProvider({ currentPageName, children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light");
  const enabled = !!currentPageName && !PUBLIC_PAGES.has(currentPageName);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", enabled && theme === "dark");
    if (enabled) root.dataset.portalTheme = theme;
    else delete root.dataset.portalTheme;
    return () => {
      root.classList.remove("dark");
      delete root.dataset.portalTheme;
    };
  }, [enabled, theme]);
  useLayoutEffect(() => {
    const syncTheme = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) setTheme(event.newValue === "dark" ? "dark" : "light");
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}