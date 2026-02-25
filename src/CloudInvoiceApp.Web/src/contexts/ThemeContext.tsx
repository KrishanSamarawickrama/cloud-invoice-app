import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function getInitialTheme(): Theme {
  // Check localStorage first
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light" || saved === "system") return saved;

  // Default to system
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Set initial theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);

    const resolved =
      initialTheme === "system" ? getSystemTheme() : initialTheme;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    setMounted(true);
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("theme", theme);

    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, [theme, mounted]);

  // Listen for system theme changes when using "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
