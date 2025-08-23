
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { format } from 'date-fns';

export type RouteCustomer = {
  id: string;
  completed: boolean;
};

// The key is a date string in 'yyyy-MM-dd' format
export type PlannedRoutes = Record<string, RouteCustomer[]>;

type RouteContextType = {
  plannedRoutes: PlannedRoutes;
  getRouteForDate: (date: Date) => RouteCustomer[];
  addCustomerToDate: (customerId: string, date: Date) => void;
  removeCustomerFromDate: (customerId: string, date: Date) => void;
  getTodaysRoute: () => RouteCustomer[];
  markCustomerAsCompleted: (customerId: string, date?: Date) => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [plannedRoutes, setPlannedRoutes] = useLocalStorage<PlannedRoutes>('plannedRoutes', {});

  const getRouteForDate = useCallback((date: Date): RouteCustomer[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return plannedRoutes[dateKey] || [];
  }, [plannedRoutes]);
  
  const getTodaysRoute = useCallback((): RouteCustomer[] => {
    return getRouteForDate(new Date());
  }, [getRouteForDate]);

  const addCustomerToDate = useCallback((customerId: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setPlannedRoutes(prev => {
        const currentRoute = prev[dateKey] || [];
        if (currentRoute.find(c => c.id === customerId)) {
            return prev; // Already in the route for this date
        }
        return {
            ...prev,
            [dateKey]: [...currentRoute, { id: customerId, completed: false }]
        };
    });
  }, [setPlannedRoutes]);

  const removeCustomerFromDate = useCallback((customerId: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setPlannedRoutes(prev => {
        const currentRoute = prev[dateKey] || [];
        const newRoute = currentRoute.filter(c => c.id !== customerId);
        if (newRoute.length > 0) {
            return { ...prev, [dateKey]: newRoute };
        } else {
            // If the route is empty, remove the date key
            const { [dateKey]: _, ...rest } = prev;
            return rest;
        }
    });
  }, [setPlannedRoutes]);

   const markCustomerAsCompleted = useCallback((customerId: string, date: Date = new Date()) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setPlannedRoutes(prev => {
      const currentRoute = prev[dateKey] || [];
      if (!currentRoute.find(c => c.id === customerId)) {
        return prev; // Customer not on today's route, do nothing.
      }
      const newRoute = currentRoute.map(c => 
        c.id === customerId ? { ...c, completed: true } : c
      );
      return { ...prev, [dateKey]: newRoute };
    });
  }, [setPlannedRoutes]);


  return (
    <RouteContext.Provider value={{ plannedRoutes, getRouteForDate, addCustomerToDate, removeCustomerFromDate, getTodaysRoute, markCustomerAsCompleted }}>
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
