"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order } from '@/lib/data';
import { orders as initialOrders } from '@/lib/data';

type OrderContextType = {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, setOrders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
