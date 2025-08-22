
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrders } from '@/context/order-context';
import { useCustomers } from '@/context/customer-context';
import { useProducts } from '@/context/product-context';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
        <Link href="/route">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Place Order
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-12">
                    <p>You haven't placed any orders yet.</p>
                </div>
            </CardContent>
        </Card>
      ) : (
        <>
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {orders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between">
                    <span>{customer?.name || 'Unknown Customer'}</span>
                    <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(-6)}</span>
                  </CardTitle>
                  <CardDescription>{format(new Date(order.date), "PPP")}</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className='flex flex-wrap gap-1 mb-3'>
                      {Array.from(order.items.entries()).map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        return (
                          <Badge key={productId} variant="secondary">
                            {product?.name || 'Unknown Product'} x {quantity}
                          </Badge>
                        );
                      })}
                    </div>
                  <div className="text-right font-bold text-lg">R{getOrderTotal(order.items).toFixed(2)}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Desktop View */}
        <Card className="hidden md:block">
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
        </>
      )}
    </div>
  );
}
