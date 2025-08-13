
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('theme-default');
  const [logo, setLogoState] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') || 'theme-default';
    const storedLogo = localStorage.getItem('app-logo');
    setThemeState(storedTheme);
    if (storedLogo) {
      setLogoState(storedLogo);
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const setTheme = (newTheme: string) => {
    localStorage.setItem('app-theme', newTheme);
    setThemeState(newTheme);
  };

  const setLogo = (newLogo: string | null) => {
    if (newLogo) {
      localStorage.setItem('app-logo', newLogo);
    } else {
      localStorage.removeItem('app-logo');
    }
    setLogoState(newLogo);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, logo, setLogo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
