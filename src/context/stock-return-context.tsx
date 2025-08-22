
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { StockReturn } from '@/lib/data';
import { stockReturns as initialStockReturns } from '@/lib/data';

type StockReturnContextType = {
  stockReturns: StockReturn[];
  addStockReturn: (stockReturn: Omit<StockReturn, 'id' | 'date'>) => void;
};

const StockReturnContext = createContext<StockReturnContextType | undefined>(undefined);

export function StockReturnProvider({ children }: { children: ReactNode }) {
  const [stockReturns, setStockReturns] = useState<StockReturn[]>(initialStockReturns);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('stockReturns');
      if (item) {
        const parsedReturns = JSON.parse(item).map((sr: any) => ({
            ...sr,
            items: new Map(sr.items)
        }));
        setStockReturns(parsedReturns);
      }
    } catch (error) {
      console.warn("Could not parse stockReturns from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        const returnsToStore = stockReturns.map(sr => ({
            ...sr,
            items: Array.from(sr.items.entries())
        }));
      window.localStorage.setItem('stockReturns', JSON.stringify(returnsToStore));
    } catch (error) {
      console.warn("Could not save stockReturns to localStorage", error);
    }
  }, [stockReturns]);

  const addStockReturn = (stockReturn: Omit<StockReturn, 'id' | 'date'>) => {
    const newStockReturn: StockReturn = {
      ...stockReturn,
      id: `return-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setStockReturns(prev => [newStockReturn, ...prev]);
  };

  return (
    <StockReturnContext.Provider value={{ stockReturns, addStockReturn }}>
      {children}
    </StockReturnContext.Provider>
  );
}

export function useStockReturns() {
  const context = useContext(StockReturnContext);
  if (context === undefined) {
    throw new Error('useStockReturns must be used within a StockReturnProvider');
  }
  return context;
}
