
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Customer } from '@/lib/data';
import { customers as initialCustomers } from '@/lib/data';

type CustomerContextType = {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  updateCustomerImage: (customerId: string, imageUrl: string) => void;
  updateCustomerAddress: (customerId: string, address: string) => void;
  updateCustomerField: (customerId: string, field: keyof Omit<Customer, 'id' | 'status'>, value: string) => void;
  updateCustomerStatus: (customerId: string, status: Customer['status']) => void;
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const updateCustomerImage = (customerId: string, imageUrl: string) => {
    setCustomers(prev => 
      prev.map(c => 
        c.id === customerId ? { ...c, storefrontImage: imageUrl } : c
      )
    );
  };

  const updateCustomerAddress = (customerId: string, address: string) => {
    setCustomers(prev => 
      prev.map(c => 
        c.id === customerId ? { ...c, address } : c
      )
    );
  };

  const updateCustomerField = (customerId: string, field: keyof Omit<Customer, 'id' | 'status'>, value: string) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId ? { ...c, [field]: value } : c
      )
    );
  };

  const updateCustomerStatus = (customerId: string, status: Customer['status']) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId ? { ...c, status } : c
      )
    );
  };

  return (
    <CustomerContext.Provider value={{ customers, setCustomers, updateCustomerImage, updateCustomerAddress, updateCustomerField, updateCustomerStatus }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
