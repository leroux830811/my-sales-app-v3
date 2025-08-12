"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Activity, Bell, Package } from "lucide-react";
import { format } from "date-fns";
import { useCustomers } from "@/context/customer-context";
import { useInteractions } from "@/context/interaction-context";
import { useProducts } from "@/context/product-context";
import { useOrders } from "@/context/order-context";
import { useReminders } from "@/context/reminder-context";

export default function DashboardPage() {
  const { customers } = useCustomers();
  const { interactions } = useInteractions();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { reminders } = useReminders();

  const totalSales = orders.reduce((acc, order) => {
    let orderTotal = 0;
    order.items.forEach((quantity, productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            orderTotal += product.price * quantity;
        }
    });
    return acc + orderTotal;
  }, 0);
  
  const newCustomers = customers.filter(c => c.status === 'Lead').length;
  const productsSoldCount = 432;
  const interactionCount = interactions.length;
  const upcomingReminders = reminders.filter(r => !r.isComplete);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/orders">
            <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">R{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">Based on completed orders</p>
            </CardContent>
            </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newCustomers}</div>
            <p className="text-xs text-muted-foreground">0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{products.length}</div>
            <p className="text-xs text-muted-foreground">0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions Logged</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{interactionCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            {interactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interactions.slice(0, 5).map(interaction => {
                    const customer = customers.find(c => c.id === interaction.customerId);
                    return (
                      <TableRow key={interaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={`https://placehold.co/40x40.png?text=${customer?.name.charAt(0)}`} />
                              <AvatarFallback>{customer?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customer?.name}</div>
                              <div className="text-sm text-muted-foreground">{customer?.contactPerson}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={interaction.type === "Email" ? "secondary" : "outline"}>{interaction.type}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(interaction.date), "PPP")}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{interaction.notes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">No recent interactions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/reminders" className="lg:col-span-3">
            <Card className="h-full hover:bg-muted/50 transition-colors">
            <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent>
                {upcomingReminders.length > 0 ? (
                <div className="space-y-4">
                    {upcomingReminders.slice(0, 5).map(reminder => {
                    const customer = customers.find(c => c.id === reminder.customerId);
                    return (
                        <div key={reminder.id} className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center">
                            <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">{reminder.customerId ? `Follow up with ${customer?.contactPerson}` : reminder.notes}</p>
                            {reminder.customerId && <p className="text-sm text-muted-foreground">{reminder.notes}</p>}
                            <p className="text-xs text-muted-foreground">{format(new Date(reminder.date), "PPP")}</p>
                        </div>
                        </div>
                    );
                    })}
                </div>
                ) : (
                    <div className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground">No upcoming reminders.</p>
                    </div>
                )}
            </CardContent>
            </Card>
        </Link>
      </div>
    </div>
  );
}
