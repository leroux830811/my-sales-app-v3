
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { format } from 'date-fns';

// The key is a date string in 'yyyy-MM-dd' format
export type PlannedRoutes = Record<string, string[]>;

type RouteContextType = {
  plannedRoutes: PlannedRoutes;
  getRouteForDate: (date: Date) => string[];
  addCustomerToDate: (customerId: string, date: Date) => void;
  removeCustomerFromDate: (customerId: string, date: Date) => void;
  getTodaysRoute: () => string[];
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [plannedRoutes, setPlannedRoutes] = useLocalStorage<PlannedRoutes>('plannedRoutes', {});

  const getRouteForDate = useCallback((date: Date): string[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return plannedRoutes[dateKey] || [];
  }, [plannedRoutes]);
  
  const getTodaysRoute = useCallback((): string[] => {
    const dateKey = format(new Date(), 'yyyy-MM-dd');
    return plannedRoutes[dateKey] || [];
  }, [plannedRoutes]);

  const addCustomerToDate = useCallback((customerId: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setPlannedRoutes(prev => {
        const currentRoute = prev[dateKey] || [];
        if (currentRoute.includes(customerId)) {
            return prev; // Already in the route for this date
        }
        return {
            ...prev,
            [dateKey]: [...currentRoute, customerId]
        };
    });
  }, [setPlannedRoutes]);

  const removeCustomerFromDate = useCallback((customerId: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setPlannedRoutes(prev => {
        const currentRoute = prev[dateKey] || [];
        const newRoute = currentRoute.filter(id => id !== customerId);
        if (newRoute.length > 0) {
            return { ...prev, [dateKey]: newRoute };
        } else {
            // If the route is empty, remove the date key
            const { [dateKey]: _, ...rest } = prev;
            return rest;
        }
    });
  }, [setPlannedRoutes]);

  return (
    <RouteContext.Provider value={{ plannedRoutes, getRouteForDate, addCustomerToDate, removeCustomerFromDate, getTodaysRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}
