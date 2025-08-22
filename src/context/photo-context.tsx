
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';

export type GeneralPhoto = {
  id: string;
  imageDataUri: string;
  createdAt: string;
  description?: string;
};

type PhotoContextType = {
  photos: GeneralPhoto[];
  addPhoto: (imageDataUri: string, description?: string) => void;
};

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useLocalStorage<GeneralPhoto[]>('photos', []);

  const addPhoto = (imageDataUri: string, description?: string) => {
    const newPhoto: GeneralPhoto = {
      id: `photo-${Date.now()}`,
      imageDataUri,
      createdAt: new Date().toISOString(),
      description,
    };
    setPhotos(prev => [newPhoto, ...prev]);
  };

  return (
    <PhotoContext.Provider value={{ photos, addPhoto }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhotos must be used within a PhotoProvider');
  }
  return context;
}
