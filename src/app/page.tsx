
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Activity, Bell, Package, Zap, User, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { useCustomers } from "@/context/customer-context";
import { useInteractions } from "@/context/interaction-context";
import { useProducts } from "@/context/product-context";
import { useOrders } from "@/context/order-context";
import { useReminders } from "@/context/reminder-context";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Customer, Interaction } from "@/lib/data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";


export default function DashboardPage() {
  const { customers, updateCustomerField, updateCustomerStatus, deleteCustomer } = useCustomers();
  const { interactions } = useInteractions();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { reminders } = useReminders();
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const getInteractionBadgeVariant = (type: Interaction['type']): "secondary" | "outline" | "destructive" => {
    switch (type) {
        case 'Competitor Activity':
            return 'destructive';
        case 'Email':
            return 'secondary';
        default:
            return 'outline';
    }
  }
  
  const getStatusVariant = (status: "Active" | "Inactive" | "Lead") => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Lead":
        return "outline";
    }
  }

  const totalSales = orders.reduce((acc, order) => acc + getOrderTotal(order.items), 0);
  
  const salesByDay = orders.reduce((acc, order) => {
    const date = format(startOfDay(new Date(order.date)), 'yyyy-MM-dd');
    const total = getOrderTotal(order.items);
    acc[date] = (acc[date] || 0) + total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    const shortDate = format(date, 'EEE');
    return {
      date: shortDate,
      sales: salesByDay[formattedDate] || 0
    };
  }).reverse();

  const newCustomers = customers.filter(c => c.status === 'Lead').length;
  const interactionCount = interactions.length;
  const upcomingReminders = reminders.filter(r => !r.isComplete);
  
  const customerInteractions = selectedCustomer ? interactions
    .filter(i => i.customerId === selectedCustomer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    
  const handleFieldChange = (customerId: string, field: keyof Omit<Customer, 'id' | 'status'>, value: string) => {
    updateCustomerField(customerId, field, value);
    // Also update the selected customer in state so the sheet reflects the change instantly
    if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({...selectedCustomer, [field]: value});
    }
  };
  
  const handleStatusChange = (customerId: string, status: Customer['status']) => {
    updateCustomerStatus(customerId, status);
    if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer({...selectedCustomer, status: status});
    }
  }
  
  const handleDeleteCustomer = (customerId: string) => {
    deleteCustomer(customerId);
    setSelectedCustomer(null);
    toast({
      title: "Customer Deleted",
      description: "The customer has been permanently removed.",
    });
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-[hsl(var(--muted))]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/orders">
            <Card className="hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">R{isClient ? totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
                <p className="text-xs text-muted-foreground">Based on completed orders</p>
                <div className="h-[80px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="url(#colorSales)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{isClient ? newCustomers : 0}</div>
            <p className="text-xs text-muted-foreground">0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{isClient ? products.length : 0}</div>
            <p className="text-xs text-muted-foreground">0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions Logged</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{isClient ? interactionCount : 0}</div>
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
            {isClient && interactions.length > 0 ? (
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
                      <TableRow key={interaction.id} onClick={() => customer && setSelectedCustomer(customer)} className="cursor-pointer">
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
                          <Badge variant={getInteractionBadgeVariant(interaction.type)}>
                            {interaction.type === 'Competitor Activity' && <Zap className="mr-1 h-3 w-3" />}
                            {interaction.type}
                          </Badge>
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
                <p className="text-muted-foreground">{isClient && interactions.length === 0 ? "No recent interactions." : "Loading..."}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Link href="/reminders" className="lg:col-span-3">
            <Card className="h-full hover:bg-card/80 transition-colors">
            <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent>
                {isClient && upcomingReminders.length > 0 ? (
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
                        <p className="text-muted-foreground">{isClient && upcomingReminders.length === 0 ? "No upcoming reminders." : "Loading..."}</p>
                    </div>
                )}
            </CardContent>
            </Card>
        </Link>
      </div>
      
       <Sheet open={!!selectedCustomer} onOpenChange={(isOpen) => !isOpen && setSelectedCustomer(null)}>
            <SheetContent className="sm:max-w-lg w-full flex flex-col">
                {selectedCustomer && (
                    <>
                        <SheetHeader className="pb-4">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://placehold.co/64x64.png?text=${selectedCustomer.name.charAt(0)}`} />
                                    <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <SheetTitle className="text-2xl">{selectedCustomer.name}</SheetTitle>
                                    <SheetDescription asChild>
                                        <Badge variant={getStatusVariant(selectedCustomer.status)}>{selectedCustomer.status}</Badge>
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>
                        <ScrollArea className="flex-1 -mr-6">
                        <div className="space-y-4 pr-6">
                            <div className="space-y-2">
                                <Label htmlFor="name"><User className="inline-block mr-2 h-4 w-4" />Customer Name</Label>
                                <Input id="name" defaultValue={selectedCustomer.name} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson"><User className="inline-block mr-2 h-4 w-4" />Contact Person</Label>
                                <Input id="contactPerson" defaultValue={selectedCustomer.contactPerson} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'contactPerson', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="town"><MapPin className="inline-block mr-2 h-4 w-4" />Town</Label>
                                <Input id="town" defaultValue={selectedCustomer.town} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'town', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address"><MapPin className="inline-block mr-2 h-4 w-4" />Address</Label>
                                <Input id="address" defaultValue={selectedCustomer.address} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'address', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone"><Phone className="inline-block mr-2 h-4 w-4" />Phone</Label>
                                <Input id="phone" defaultValue={selectedCustomer.phone} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'phone', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email"><Mail className="inline-block mr-2 h-4 w-4" />Email</Label>
                                <Input id="email" defaultValue={selectedCustomer.email} onBlur={(e) => handleFieldChange(selectedCustomer.id, 'email', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="status"><Badge className="mr-2" />Status</Label>
                                <Select
                                    defaultValue={selectedCustomer.status}
                                    onValueChange={(value: Customer['status']) => handleStatusChange(selectedCustomer.id, value)}
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                             <div>
                                <h4 className="font-semibold mb-4">Interaction History</h4>
                                <div className="space-y-4">
                                    {customerInteractions.length > 0 ? customerInteractions.map(interaction => (
                                        <div key={interaction.id} className="text-sm">
                                            <div className="flex justify-between items-center">
                                                <p className="font-medium">{format(new Date(interaction.date), "PPP p")}</p>
                                                <Badge variant={getInteractionBadgeVariant(interaction.type)}>
                                                    {interaction.type === 'Competitor Activity' && <Zap className="mr-1 h-3 w-3" />}
                                                    {interaction.type}
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground whitespace-pre-wrap pl-2 border-l-2 ml-2 mt-1">{interaction.notes}</p>
                                        </div>
                                    )) : <p className="text-muted-foreground text-sm text-center">No interactions logged yet.</p>}
                                </div>
                            </div>
                        </div>
                        </ScrollArea>
                        <SheetFooter className="pt-4 mt-auto">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the customer and all their associated data from the app.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                                    >
                                        Yes, delete customer
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    </div>
  );
}
