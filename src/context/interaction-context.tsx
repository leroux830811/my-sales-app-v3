"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Interaction } from '@/lib/data';
import { interactions as initialInteractions } from '@/lib/data';

type InteractionContextType = {
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
  addInteraction: (interaction: Omit<Interaction, 'id' | 'date'>) => void;
};

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions);

  const addInteraction = (interaction: Omit<Interaction, 'id' | 'date'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: `interaction-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setInteractions(prev => [newInteraction, ...prev]);
  };

  return (
    <InteractionContext.Provider value={{ interactions, setInteractions, addInteraction }}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteractions() {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error('useInteractions must be used within an InteractionProvider');
  }
  return context;
}
