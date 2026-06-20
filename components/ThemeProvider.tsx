"use client";

import * as React from "react";

type Attribute = `data-${string}` | "class";

interface ThemeProviderProps extends React.PropsWithChildren {
  themes?: string[];
  forcedTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  defaultTheme?: string;
  attribute?: Attribute | Attribute[];
  value?: Record<string, string>;
}

interface ThemeContextValue {
  theme: string;
  resolvedTheme: string;
  forcedTheme?: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  systemTheme: "light" | "dark";
  themes: string[];
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getAttributeValues(theme: string, value?: Record<string, string>) {
  return value && theme in value ? value[theme] : theme;
}

function applyTheme(
  theme: string,
  attribute: Attribute | Attribute[] = "class",
  themes: string[] = ["light", "dark"],
  value?: Record<string, string>,
  enableColorScheme = true,
) {
  const actualTheme = theme === "system" ? getSystemTheme() : theme;
  const attrs = Array.isArray(attribute) ? attribute : [attribute];
  const element = document.documentElement;

  attrs.forEach((attr) => {
    if (attr === "class") {
      const classNames = themes.map((themeName) =>
        getAttributeValues(themeName, value),
      );
      element.classList.remove(...classNames.filter(Boolean));
      const themeClass = getAttributeValues(actualTheme, value);
      if (themeClass) element.classList.add(themeClass);
    }
    else {
      const attrName = attr;
      const themeValue = getAttributeValues(actualTheme, value);
      if (themeValue) {
        element.setAttribute(attrName, themeValue);
      }
      else {
        element.removeAttribute(attrName);
      }
    }
  });

  if (enableColorScheme) {
    element.style.colorScheme = actualTheme === "dark" ? "dark" : "light";
  }
}

export function ThemeProvider({
  children,
  themes = ["light", "dark"],
  forcedTheme,
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorScheme = true,
  storageKey = "theme",
  defaultTheme = "system",
  attribute = "class",
  value,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<string>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(
    "light",
  );

  // Wrapper around setThemeState that also persists to localStorage
  const setTheme = React.useCallback(
    (newTheme: string | ((prev: string) => string)) => {
      const resolvedTheme =
        typeof newTheme === "function" ? newTheme(theme) : newTheme;

      setThemeState(resolvedTheme);

      // Persist to localStorage
      try {
        window.localStorage.setItem(storageKey, resolvedTheme);
      } catch {
        // ignore localStorage failures
      }
    },
    [theme, storageKey],
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      const resolved = mediaQuery.matches ? "dark" : "light";
      setSystemTheme(resolved);
    };

    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  React.useEffect(() => {
    if (forcedTheme) {
      setThemeState(forcedTheme);
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setThemeState(stored);
        return;
      }
    } catch {
      // ignore localStorage failures
    }

    setThemeState(defaultTheme);
  }, [forcedTheme, storageKey, defaultTheme]);

  React.useEffect(() => {
    applyTheme(theme, attribute, themes, value, enableColorScheme);
  }, [theme, attribute, themes, value, enableColorScheme, systemTheme]);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const contextValue = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      forcedTheme,
      setTheme,
      systemTheme,
      themes,
    }),
    [theme, resolvedTheme, forcedTheme, setTheme, systemTheme, themes],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
