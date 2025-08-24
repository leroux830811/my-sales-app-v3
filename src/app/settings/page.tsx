
"use client";

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/context/customer-context';
import type { Customer, Product, StockReturn } from '@/lib/data';
import { FilePlus, PlusCircle, Palette, Download, Calendar as CalendarIcon, SlidersHorizontal, ArrowLeftRight, ChevronDown, Trash2 } from 'lucide-react';
import { useProducts } from '@/context/product-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/context/theme-context';
import { useOrders } from '@/context/order-context';
import { useInteractions } from '@/context/interaction-context';
import { useReminders } from '@/context/reminder-context';
import { format, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useStockReturns } from '@/context/stock-return-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type ReportType = 'all' | 'sales' | 'interactions' | 'returns';

export default function SettingsPage() {
    const { customers, setCustomers } = useCustomers();
    const { products, setProducts } = useProducts();
    const { orders } = useOrders();
    const { interactions } = useInteractions();
    const { reminders } = useReminders();
    const { stockReturns } = useStockReturns();
    const { 
        theme, 
        setTheme,
        sidebarLayout,
        setSidebarLayout,
        sidebarBehavior,
        setSidebarBehavior
    } = useTheme();
    const { toast } = useToast();

    // Add Customer State
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'storefrontImage'>>({
        name: '', town: '', address: '', contactPerson: '', phone: '', email: '', status: 'Lead',
    });
    
    // Reporting State
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfDay(new Date(new Date().setDate(1))),
        to: startOfDay(new Date()),
    });

    const handleCustomerFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json<any>(worksheet);
    
              const newCustomersData: Customer[] = json.map((row, index) => ({
                id: `imported-${Date.now()}-${index}`,
                name: row['Customer Name'] || row['name'] || '',
                town: row['Town'] || row['town'] || '',
                address: row['Address'] || row['address'] || '',
                contactPerson: row['Contact Person'] || row['contactPerson'] || '',
                phone: row['Phone'] || row['phone'] || '',
                email: row['Email'] || row['email'] || '',
                status: row['Status'] || row['status'] || 'Lead',
              }));
    
              setCustomers(prev => [...prev, ...newCustomersData]);
              toast({ title: "Success", description: `${newCustomersData.length} customers imported successfully.` });
            } catch (error) {
              console.error("Error parsing Excel file:", error);
              toast({ title: "Import Failed", description: "Could not parse the customer Excel file.", variant: "destructive" });
            }
          };
          reader.readAsArrayBuffer(file);
        }
    };

    const handleProductFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json<any>(worksheet);
    
              const newProductsData: Product[] = json.map((row, index) => ({
                id: `imported-${Date.now()}-${index}`,
                name: row['Name'] || row['name'],
                description: row['Description'] || row['description'],
                price: parseFloat(row['Price'] || row['price'] || 0),
                stock: parseInt(row['Stock'] || row['stock'] || 0),
                size: row['Size'] || row['size'] || 'N/A',
                image: 'https://placehold.co/600x400.png" data-ai-hint="deli meat',
              }));
    
              setProducts(prev => [...prev, ...newProductsData]);
              toast({ title: "Success", description: `${newProductsData.length} products imported successfully.` });
            } catch (error) {
              console.error("Error parsing Excel file:", error);
              toast({ title: "Import Failed", description: "Could not parse the product Excel file.", variant: "destructive" });
            }
          };
          reader.readAsArrayBuffer(file);
        }
      };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (value: Customer['status']) => {
        setNewCustomer(prev => ({ ...prev, status: value }));
    };

    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.contactPerson) {
            toast({ title: "Missing Information", description: "Please fill in at least customer name and contact person.", variant: "destructive" });
            return;
        }
        const customerToAdd: Customer = { id: `manual-${Date.now()}`, ...newCustomer };
        setCustomers(prev => [...prev, customerToAdd]);
        toast({ title: "Customer Added", description: `${newCustomer.name} has been added.` });
        setNewCustomer({ name: '', town: '', address: '', contactPerson: '', phone: '', email: '', status: 'Lead' });
        setIsAddCustomerOpen(false);
    };

    const handleRemoveAllCustomers = () => {
        setCustomers([]);
        // Consider removing related data like interactions, orders etc.
        toast({ title: "All Customers Removed", description: "Your customer list has been cleared." });
    };
    
    const handleRemoveAllProducts = () => {
        setProducts([]);
        toast({ title: "All Products Removed", description: "Your product list has been cleared." });
    };

    const getOrderTotal = (orderItems: Map<string, number>) => {
        let total = 0;
        orderItems.forEach((quantity, productId) => {
            const product = products.find(p => p.id === productId);
            if (product) total += product.price * quantity;
        });
        return total;
    };
    
    const getReturnTotal = (stockReturnItems: Map<string, number>) => {
        let total = 0;
        stockReturnItems.forEach((quantity, productId) => {
            const product = products.find(p => p.id === productId);
            if (product) total += product.price * quantity;
        });
        return total;
    }

    const handleGenerateReport = (reportType: ReportType) => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({ title: "Date range not selected", description: "Please select a start and end date.", variant: "destructive" });
            return;
        }

        const startDate = startOfDay(dateRange.from);
        const endDate = startOfDay(dateRange.to);
        const wb = XLSX.utils.book_new();
        let reportGenerated = false;

        if (reportType === 'all' || reportType === 'sales') {
            const filteredOrders = orders.filter(o => {
                const orderDate = startOfDay(new Date(o.date));
                return orderDate >= startDate && orderDate <= endDate;
            });
            const salesData = filteredOrders.map(o => {
                const customer = customers.find(c => c.id === o.customerId);
                return {
                    'Order ID': o.id.slice(-6), 'Customer': customer?.name || 'Unknown', 'Date': format(new Date(o.date), 'yyyy-MM-dd'),
                    'Total': getOrderTotal(o.items),
                    'Items': Array.from(o.items.entries()).map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        return `${product?.name || 'Unknown'} x${quantity}`;
                    }).join(', '),
                };
            });
             if(salesData.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesData), 'Sales Report');
                reportGenerated = true;
            }
        }
        
        if (reportType === 'all') {
            const newCustomersData = customers.filter(c => {
                if(c.id.startsWith('imported-') || c.id.startsWith('manual-')) {
                     const timestamp = parseInt(c.id.split('-')[1]);
                     const creationDate = startOfDay(new Date(timestamp));
                     return creationDate >= startDate && creationDate <= endDate;
                }
                return false;
            }).map(c => ({ 'Name': c.name, 'Contact Person': c.contactPerson, 'Town': c.town, 'Status': c.status, 'Email': c.email, 'Phone': c.phone }));
             if(newCustomersData.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(newCustomersData), 'New Customers');
                reportGenerated = true;
            }
        }
        
        if (reportType === 'all' || reportType === 'interactions') {
            const filteredInteractions = interactions.filter(i => {
                const interactionDate = startOfDay(new Date(i.date));
                return interactionDate >= startDate && interactionDate <= endDate;
            }).map(i => {
                 const customer = customers.find(c => c.id === i.customerId);
                 return { 'Date': format(new Date(i.date), 'yyyy-MM-dd HH:mm'), 'Customer': customer?.name || 'Unknown', 'Type': i.type, 'Notes': i.notes };
            });
            if(filteredInteractions.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredInteractions), 'Interactions');
                reportGenerated = true;
            }
        }

        if (reportType === 'all') {
             const filteredReminders = reminders.filter(r => {
                const reminderDate = startOfDay(new Date(r.date));
                return reminderDate >= startDate && reminderDate <= endDate;
            }).map(r => {
                 const customer = customers.find(c => c.id === r.customerId);
                return { 'Date': format(new Date(r.date), 'yyyy-MM-dd'), 'Customer': r.customerId ? customer?.name : 'General', 'Notes': r.notes, 'Status': r.isComplete ? 'Complete' : 'Pending' };
            });
             if(filteredReminders.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredReminders), 'Reminders');
                reportGenerated = true;
            }
        }

        if (reportType === 'all' || reportType === 'returns') {
             const filteredReturns = stockReturns.filter(sr => {
                const returnDate = startOfDay(new Date(sr.date));
                return returnDate >= startDate && returnDate <= endDate;
             });
             const returnsData = filteredReturns.map(sr => {
                const customer = customers.find(c => c.id === sr.customerId);
                return {
                    'Return ID': sr.id.slice(-6), 'Customer': customer?.name || 'Unknown', 'Date': format(new Date(sr.date), 'yyyy-MM-dd'),
                    'Reason': sr.reason,
                    'Total Value': getReturnTotal(sr.items),
                    'Items': Array.from(sr.items.entries()).map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        return `${product?.name || 'Unknown'} x${quantity}`;
                    }).join(', '),
                }
             });
            if (returnsData.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(returnsData), 'Stock Returns');
                reportGenerated = true;
            }
        }
        
        if (!reportGenerated) {
            toast({ title: "No Data Found", description: `No data available for the selected date range and report type.`, variant: "destructive" });
            return;
        }

        XLSX.writeFile(wb, `BB-Sales-Pro-${reportType}-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.xlsx`);
        toast({ title: "Report Generated", description: `Your report has been downloaded.` });
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manage customers and products. Add manually or import from Excel files.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Add Customer</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader><DialogTitle>Add New Customer</DialogTitle><DialogDescription>Fill in the details below.</DialogDescription></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Customer Name</Label><Input id="name" name="name" value={newCustomer.name} onChange={handleInputChange} className="col-span-3" /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="contactPerson" className="text-right">Contact Person</Label><Input id="contactPerson" name="contactPerson" value={newCustomer.contactPerson} onChange={handleInputChange} className="col-span-3" /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="town" className="text-right">Town</Label><Input id="town" name="town" value={newCustomer.town} onChange={handleInputChange} className="col-span-3" /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="address" className="text-right">Address</Label><Input id="address" name="address" value={newCustomer.address} onChange={handleInputChange} className="col-span-3" /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Phone</Label><Input id="phone" name="phone" value={newCustomer.phone} onChange={handleInputChange} className="col-span-3" /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" name="email" type="email" value={newCustomer.email} onChange={handleInputChange} className="col-span-3" /></div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <Select name="status" value={newCustomer.status} onValueChange={handleStatusChange}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Lead">Lead</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter><Button onClick={handleAddCustomer}>Save Customer</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild><Button variant="outline"><FilePlus className="mr-2 h-4 w-4" /> Import Customers</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader><DialogTitle>Upload Customer List</DialogTitle><DialogDescription>Import from Excel. Columns: Customer Name, Town, Address, Contact Person, Phone, Email, Status.</DialogDescription></DialogHeader>
                                <div className="grid w-full items-center gap-1.5 py-4"><Label htmlFor="customer-file">Excel File</Label><Input id="customer-file" type="file" accept=".xlsx, .xls" onChange={handleCustomerFileImport} /></div>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                                <DialogTrigger asChild><Button variant="outline"><FilePlus className="mr-2 h-4 w-4" /> Import Products</Button></DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                <DialogHeader><DialogTitle>Upload Product List</DialogTitle><DialogDescription>Import from Excel. Columns: Name, Description, Price, Stock, Size.</DialogDescription></DialogHeader>
                                <div className="grid w-full items-center gap-1.5 py-4"><Label htmlFor="product-file">Excel File</Label><Input id="product-file" type="file" accept=".xlsx, .xls" onChange={handleProductFileImport} /></div>
                                </DialogContent>
                        </Dialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Remove All Customers</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete all customer data. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRemoveAllCustomers}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Remove All Products</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete all product data. This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRemoveAllProducts}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look and feel.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme" className="flex items-center gap-2"><Palette className="h-4 w-4" /> Color Theme</Label>
                            <Select value={theme} onValueChange={setTheme}><SelectTrigger id="theme" className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="theme-default">Default</SelectItem>
                                    <SelectItem value="theme-zinc">Zinc</SelectItem>
                                    <SelectItem value="theme-rose">Rose</SelectItem>
                                    <SelectItem value="theme-blue">Blue</SelectItem>
                                    <SelectItem value="theme-green">Green</SelectItem>
                                    <SelectItem value="theme-orange">Orange</SelectItem>
                                    <SelectItem value="theme-violet">Violet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="sidebar-layout" className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Sidebar Layout</Label>
                            <Select value={sidebarLayout} onValueChange={setSidebarLayout as any}><SelectTrigger id="sidebar-layout" className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sidebar">Default</SelectItem>
                                    <SelectItem value="floating">Floating</SelectItem>
                                    <SelectItem value="inset">Inset</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="sidebar-behavior" className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> Sidebar Behavior</Label>
                            <Select value={sidebarBehavior} onValueChange={setSidebarBehavior as any}><SelectTrigger id="sidebar-behavior" className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="icon">Icon</SelectItem>
                                    <SelectItem value="offcanvas">Off-canvas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Reporting</CardTitle><CardDescription>Generate and export reports.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Report Period</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Pick a date</span>)}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Generate Report
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                <DropdownMenuItem onSelect={() => handleGenerateReport('all')}>Full Activity Report</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleGenerateReport('sales')}>Sales Only</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleGenerateReport('interactions')}>Interactions Only</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleGenerateReport('returns')}>Stock Returns Only</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    