"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Reminder } from '@/lib/data';
import { reminders as initialReminders } from '@/lib/data';

type ReminderContextType = {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  toggleReminderComplete: (reminderId: string) => void;
};

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `reminder-${Date.now()}`,
    };
    setReminders(prev => [newReminder, ...prev].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const toggleReminderComplete = (reminderId: string) => {
    setReminders(prev => 
        prev.map(r => 
            r.id === reminderId ? { ...r, isComplete: !r.isComplete } : r
        )
    )
  }

  return (
    <ReminderContext.Provider value={{ reminders, setReminders, addReminder, toggleReminderComplete }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
}
