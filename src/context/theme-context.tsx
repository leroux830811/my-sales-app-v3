
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type SidebarProps } from '@/components/ui/sidebar';

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  sidebarLayout: SidebarProps['variant'];
  setSidebarLayout: (layout: SidebarProps['variant']) => void;
  sidebarBehavior: SidebarProps['collapsible'];
  setSidebarBehavior: (behavior: SidebarProps['collapsible']) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('theme-default');
  const [logo, setLogoState] = useState<string | null>(null);
  const [sidebarLayout, setSidebarLayoutState] = useState<SidebarProps['variant']>('sidebar');
  const [sidebarBehavior, setSidebarBehaviorState] = useState<SidebarProps['collapsible']>('icon');

  useEffect(() => {
    const storedTheme = localStorage.getItem('app-theme') || 'theme-default';
    const storedLogo = localStorage.getItem('app-logo');
    const storedLayout = localStorage.getItem('sidebar-layout') as SidebarProps['variant'] || 'sidebar';
    const storedBehavior = localStorage.getItem('sidebar-behavior') as SidebarProps['collapsible'] || 'icon';
    setThemeState(storedTheme);
    if (storedLogo) {
      setLogoState(storedLogo);
    }
    setSidebarLayoutState(storedLayout);
    setSidebarBehaviorState(storedBehavior);
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

  const setSidebarLayout = (newLayout: SidebarProps['variant']) => {
    localStorage.setItem('sidebar-layout', newLayout || 'sidebar');
    setSidebarLayoutState(newLayout);
  };

  const setSidebarBehavior = (newBehavior: SidebarProps['collapsible']) => {
      localStorage.setItem('sidebar-behavior', newBehavior || 'icon');
      setSidebarBehaviorState(newBehavior);
  };

  return (
    <ThemeContext.Provider value={{ 
        theme, setTheme, 
        logo, setLogo, 
        sidebarLayout, setSidebarLayout,
        sidebarBehavior, setSidebarBehavior
    }}>
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
