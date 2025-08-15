
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
import type { Customer, Product } from '@/lib/data';
import { FilePlus, PlusCircle, Palette, Download, Calendar as CalendarIcon, Users, Trash2 } from 'lucide-react';
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
import { useAuth } from '@/context/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function SettingsPage() {
    const { customers, setCustomers } = useCustomers();
    const { products, setProducts } = useProducts();
    const { orders } = useOrders();
    const { interactions } = useInteractions();
    const { reminders } = useReminders();
    const { theme, setTheme } = useTheme();
    const { users, createUser, deleteUser } = useAuth();
    const { toast } = useToast();

    // Add Customer State
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'storefrontImage'>>({
        name: '', town: '', address: '', contactPerson: '', phone: '', email: '', status: 'Lead',
    });
    
    // Add User State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');

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

    const handleAddUser = async () => {
        if (!newUserEmail) {
            toast({ title: "Missing Information", description: "Please provide an email.", variant: "destructive" });
            return;
        }
        try {
            await createUser(newUserEmail, newUserPassword);
            toast({ title: "User Added to List", description: `User ${newUserEmail} has been added. Please create their account in the Firebase Console.` });
            setNewUserEmail('');
            setNewUserPassword('');
            setIsAddUserOpen(false);
        } catch (error: any) {
            toast({ title: "Error Adding User", description: error.message, variant: "destructive" });
        }
    };
    
    const handleDeleteUser = async (uid: string, email?: string | null) => {
        try {
            await deleteUser(uid);
            toast({ title: "User Removed from List", description: `User ${email || uid} has been removed from the list. Please also remove from Firebase Console.` });
        } catch(error: any) {
            toast({ title: "Error Removing User", description: error.message, variant: "destructive" });
        }
    }

    const getOrderTotal = (orderItems: Map<string, number>) => {
        let total = 0;
        orderItems.forEach((quantity, productId) => {
            const product = products.find(p => p.id === productId);
            if (product) total += product.price * quantity;
        });
        return total;
    };

    const handleGenerateReport = () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({ title: "Date range not selected", description: "Please select a start and end date.", variant: "destructive" });
            return;
        }

        const startDate = startOfDay(dateRange.from);
        const endDate = startOfDay(dateRange.to);

        const filteredOrders = orders.filter(o => {
            const orderDate = startOfDay(new Date(o.date));
            return orderDate >= startDate && orderDate <= endDate;
        });

        const salesData = filteredOrders.map(o => {
            const customer = customers.find(c => c.id === o.customerId);
            return {
                'Order ID': o.id.slice(-6), 'Customer': customer?.name || 'Unknown', 'Date': format(new Date(o.date), 'yyyy-MM-dd'),
                'Total': `R${getOrderTotal(o.items).toFixed(2)}`,
                'Items': Array.from(o.items.entries()).map(([productId, quantity]) => {
                    const product = products.find(p => p.id === productId);
                    return `${product?.name || 'Unknown'} x${quantity}`;
                }).join(', '),
            };
        });

        const newCustomersData = customers.filter(c => {
            if(c.id.startsWith('imported-') || c.id.startsWith('manual-')) {
                 const timestamp = parseInt(c.id.split('-')[1]);
                 const creationDate = startOfDay(new Date(timestamp));
                 return creationDate >= startDate && creationDate <= endDate;
            }
            return false;
        }).map(c => ({ 'Name': c.name, 'Contact Person': c.contactPerson, 'Town': c.town, 'Status': c.status, 'Email': c.email, 'Phone': c.phone }));
        
        const filteredInteractions = interactions.filter(i => {
            const interactionDate = startOfDay(new Date(i.date));
            return interactionDate >= startDate && interactionDate <= endDate;
        }).map(i => {
             const customer = customers.find(c => c.id === i.customerId);
             return { 'Date': format(new Date(i.date), 'yyyy-MM-dd HH:mm'), 'Customer': customer?.name || 'Unknown', 'Type': i.type, 'Notes': i.notes };
        });

        const filteredReminders = reminders.filter(r => {
            const reminderDate = startOfDay(new Date(r.date));
            return reminderDate >= startDate && reminderDate <= endDate;
        }).map(r => {
             const customer = customers.find(c => c.id === r.customerId);
            return { 'Date': format(new Date(r.date), 'yyyy-MM-dd'), 'Customer': r.customerId ? customer?.name : 'General', 'Notes': r.notes, 'Status': r.isComplete ? 'Complete' : 'Pending' };
        });

        const wb = XLSX.utils.book_new();
        if(salesData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesData), 'Sales Report');
        if(newCustomersData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(newCustomersData), 'New Customers');
        if(filteredInteractions.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredInteractions), 'Interactions');
        if(filteredReminders.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filteredReminders), 'Reminders');
        
        if (wb.SheetNames.length === 0) {
            toast({ title: "No Data Found", description: `No data available for the selected date range.`, variant: "destructive" });
            return;
        }

        XLSX.writeFile(wb, `BB-Sales-Pro-report-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.xlsx`);
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
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look and feel.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme" className="flex items-center gap-2"><Palette className="h-4 w-4" /> App Theme</Label>
                            <Select value={theme} onValueChange={setTheme}><SelectTrigger id="theme" className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="theme-default">Default</SelectItem><SelectItem value="theme-zinc">Zinc</SelectItem><SelectItem value="theme-rose">Rose</SelectItem><SelectItem value="theme-blue">Blue</SelectItem><SelectItem value="theme-green">Green</SelectItem></SelectContent>
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
                        <Button className="w-full" onClick={handleGenerateReport}><Download className="mr-2 h-4 w-4" /> Generate & Export Report</Button>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Add or remove users who can access this application. Users must be created in Firebase Console.</CardDescription>
                            </div>
                            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                                <DialogTrigger asChild><Button><Users className="mr-2 h-4 w-4" />Add New User</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Add New User to List</DialogTitle>
                                      <DialogDescription>
                                        Enter the user's email to add them to the list. You must still create their account in the Firebase Authentication console.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2"><Label htmlFor="new-email">Email</Label><Input id="new-email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} /></div>
                                    </div>
                                    <DialogFooter><Button onClick={handleAddUser}>Add User to List</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.uid} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <span className="font-medium">{user.email}</span>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will remove user {user.email} from this list. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.uid, user.email)}>Continue</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
