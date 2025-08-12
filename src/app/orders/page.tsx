"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from '@/context/order-context';
import { useCustomers } from '@/context/customer-context';
import { useProducts } from '@/context/product-context';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();

  const getOrderTotal = (orderItems: Map<string, number>) => {
    let total = 0;
    orderItems.forEach((quantity, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        total += product.price * quantity;
      }
    });
    return total;
  };

  if (orders.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
        </div>
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                    <p>You haven't placed any orders yet.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">#{order.id.slice(-6)}</TableCell>
                    <TableCell>{customer?.name || 'Unknown Customer'}</TableCell>
                    <TableCell>{format(new Date(order.date), "PPP")}</TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {Array.from(order.items.entries()).map(([productId, quantity]) => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <Badge key={productId} variant="secondary">
                              {product?.name || 'Unknown Product'} x {quantity}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">R{getOrderTotal(order.items).toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
