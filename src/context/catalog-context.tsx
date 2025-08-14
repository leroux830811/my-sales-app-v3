
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CatalogContextType = {
  catalogPdf: string | null;
  setCatalogPdf: (catalog: string | null) => void;
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalogPdf, setCatalogPdfState] = useState<string | null>(null);

  useEffect(() => {
    const storedCatalog = localStorage.getItem('app-catalog-pdf');
    if (storedCatalog) {
      setCatalogPdfState(storedCatalog);
    }
  }, []);

  const setCatalogPdf = (newCatalog: string | null) => {
    if (newCatalog) {
      localStorage.setItem('app-catalog-pdf', newCatalog);
    } else {
      localStorage.removeItem('app-catalog-pdf');
    }
    setCatalogPdfState(newCatalog);
  };

  return (
    <CatalogContext.Provider value={{ catalogPdf, setCatalogPdf }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
