
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type RouteContextType = {
  routeCustomerIds: string[];
  addToRoute: (customerId: string) => void;
  removeFromRoute: (customerId: string) => void;
  clearRoute: () => void;
};

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeCustomerIds, setRouteCustomerIds] = useState<string[]>([]);

  const addToRoute = useCallback((customerId: string) => {
    setRouteCustomerIds(prev => {
        if (prev.includes(customerId)) {
            return prev;
        }
        return [...prev, customerId];
    });
  }, []);

  const removeFromRoute = useCallback((customerId: string) => {
    setRouteCustomerIds(prev => prev.filter(id => id !== customerId));
  }, []);

  const clearRoute = useCallback(() => {
    setRouteCustomerIds([]);
  }, []);

  return (
    <RouteContext.Provider value={{ routeCustomerIds, addToRoute, removeFromRoute, clearRoute }}>
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
